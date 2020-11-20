/**
 * @typedef {import("koa").ParameterizedContext} ParameterizedContext
 */

const { UserPost, UserPostLike, UserPostComment, User } = require('../models')
const { Op, literal } = require('sequelize')
const mailer = require('../config/mail')

const getPostQueryBase = {
    attributes : [
        'id',
        'title',
        'content',
        [literal('(SELECT COUNT(*) FROM "UserPostLikes" WHERE "UserPostId" = "UserPost".id)'), 'likesCount'],
        [literal('(SELECT COUNT(*) FROM "UserPostComments" WHERE "UserPostId" = "UserPost".id)'), 'commentsCount']
    ],
    include : [UserPostLike, {
        model : UserPostComment,
        required : false,
        where : {
            ParentCommentId : null
        },
        include : {
            model : UserPostComment,
            as : 'children'
        }
    },
        {
            model : User,  attributes : ['username']
        },
    ]
}

class PostController{
    /**
     * Create post handler
     * @param {ParameterizedContext} ctx 
     */

    static async createPost(ctx){
        const { content, title, isModerationEnabled } = ctx.request.body

        if(!content || typeof content !== 'string'){
            ctx.throw(400, 'Content must not be empty')
        }

        if(!title || typeof title !== 'string'){
            ctx.throw(400, 'Title must not be empty')
        }

        const newPost = await UserPost.create({
            UserId : ctx.user.id,
            content,
            title,
            isModerationEnabled : isModerationEnabled || false
        })
        
        ctx.body = newPost
    }

    /**
     * Get post handler
     * @param {ParameterizedContext} ctx 
     */
    static async getPosts(ctx){
        let { q, order_by, sort_by } = ctx.query

        let query = getPostQueryBase

        if(order_by !== 'asc' && order_by !== 'desc'){
            order_by = 'asc'
        }

        if(q && q != ''){
            query = {
                ...query,
                where : {
                    title : {
                        [Op.iLike] : `%${q}%`
                    }
                }
            }
        }

        if(sort_by){
            let order

            switch(sort_by){
                case 'username':
                    order = [[User, 'username', order_by]]
                    break
                case 'date':
                    order = [['createdAt', order_by]]
                    break
                case 'likes':
                    order = [[literal('"likesCount"'), order_by]]
                    break
                case 'comments':
                    order = [[literal('"commentsCount"'), order_by]]
                    break
            }

            query = {
                ...query,
                order
            }
        }

        const posts = await UserPost.findAll(query)

        ctx.body = posts
    }

    /**
     * Get post by id handler
     * @param {ParameterizedContext} ctx 
     */
    static async getPostById(ctx){
        const post = await UserPost.findOne({
            ...getPostQueryBase,
            where : {
                id : ctx.params.id
            },
        })

        if(!post){
            ctx.throw(404, 'Post not found')
        }

        ctx.body = post
    }

    /**
     * Edit post handler
     * @param {ParameterizedContext} ctx 
     */
    static async editPost(ctx){
        const { content, title } = ctx.request.body

        if(!content && !title){
            ctx.throw(400, 'Either content or title must be provided')
        }

        const post = await UserPost.findOne({
            where : {
                id : ctx.params.id
            }
        })

        if(!post){
            ctx.throw(404, 'Post not found')
        }

        if(post.UserId !== ctx.user.id){
            ctx.throw(403, 'Forbidden')
        }

        await post.update({
            content : content || post.content,
            title : title || post.title
        })

        ctx.body = {
            message : 'Successfully Updated Post'
        }
    }

    /**
     * Like post handler
     * @param {ParameterizedContext} ctx 
     */
    static async likePost(ctx){
        const post = await UserPost.findOne({
            where : {
                id : ctx.params.id
            },
            include : User
        })

        if(!post){
            return ctx.throw(404, 'Post not found')
        }

        try{
            const userPostLike = await UserPostLike.create({
                UserId : ctx.user.id,
                UserPostId : ctx.params.id
            })

            // Should implement using bull queing system
            mailer.sendMail({
                from : 'Notifications <notification@mail.cruncher.xyz>',
                to : post.User.email,
                subject: `${ctx.user.username} liked your post`,
                text: `${ctx.user.username} liked your post`,
            })

            ctx.body = userPostLike
        } catch(e){
            ctx.throw(400, 'Post already liked')
        }
    }

    /**
     * Unlike post handler
     * @param {ParameterizedContext} ctx 
     */
    static async unlikePost(ctx){
        const post = await UserPostLike.destroy({
            where : {
                UserId : ctx.user.id,
                UserPostId : ctx.params.id
            }
        })

        ctx.body = post
    }

    /**
     * Comment post handler
     * @param {ParameterizedContext} ctx 
     */
    static async commentPost(ctx){
        const { content } = ctx.request.body
        const parentCommentId = ctx.params.comment_id

        if(!content || typeof content !== 'string'){
            ctx.throw(400, 'Content not provided')
        }

        const post = await UserPost.findOne({
            where : {
                id : ctx.params.id
            }
        })
        
        if(!post){
            ctx.throw(404, 'Post not found')
        }

        let query = {
            UserId : ctx.user.id,
            UserPostId : post.id,
            content
        }

        let parentComment

        if(parentCommentId){
            parentComment = await UserPostComment.findOne({
                where : {
                    id : parentCommentId
                },
                include : User
            })

            if(!parent){
                ctx.throw(404, 'Parent comment not found')
            }

            if(parent.ParentCommentId){
                ctx.throw(400, 'Comments can only be nested more than one')
            }

            query = {
                ...query,
                ParentCommentId : parentCommentId
            }
        } 

        await UserPostComment.create(query)
        
        mailer.sendMail({
            from : 'Notifications <notification@mail.cruncher.xyz>',
            to : post.User.email,
            subject: `${ctx.user.username} commented your post`,
            text: `${ctx.user.username} commented ${content} on your post about ${post.title}`,
        })

        if(parentComment){
            mailer.sendMail({
                from : 'Notifications <notification@mail.cruncher.xyz>',
                to : post.User.email,
                subject: `${ctx.user.username} replied to your comment`,
                text: `${ctx.user.username} replied to your comment on ${post.title}`,
            })
        }

        ctx.status = 201
        ctx.body = {
            message : 'Created'
        }
    }

    /**
     * Delete comment handler
     * @param {ParameterizedContext} ctx 
     */
    static async deleteComment(ctx){
        const comment = await UserPostComment.findOne({
            where : {
                id : ctx.params.comment_id
            },
            include : UserPost
        })
        
        if(!comment){
            ctx.throw(404, 'Comment Not Found')
        }

        if(comment.UserId !== ctx.user.id){
            if(comment.UserPost.UserId === ctx.user.id && !comment.UserPost.isModerationEnabled){
                ctx.throw(400, 'Moderation is disabled on this post')
            } else if(comment.UserPost.UserId !== ctx.user.id){
                ctx.throw(403, 'Forbidden')
            }
        }

        await comment.destroy()
        ctx.body = {
            message : 'Comment Deleted'
        }
    }

    /**
     * Delete post handler
     * @param {ParameterizedContext} ctx 
     */
    static async deletePost(ctx){
        const post = await UserPost.findOne({
            where : {
                id : ctx.params.id
            }
        })

        if(!post){
            ctx.throw(404, 'Post not found')
        }

        if(post.UserId !== ctx.user.id){
            ctx.throw(403, 'Forbidden')
        }

        await post.destroy()
        ctx.body = {
            message : "Post Deleted"
        }
    }
}

module.exports = PostController
