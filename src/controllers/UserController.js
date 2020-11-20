/**
 * @typedef {import("koa").ParameterizedContext} ParameterizedContext
 */

const { User, UserEmailVerification } = require('../models')
const { generateURLSafeRandom } = require('../helpers/random')
const { hashPassword, verifyPassword } = require('../helpers/password')
const { encodeJwt } = require('../helpers/jwt')

const { Op } = require('sequelize')
const mailer = require('../config/mail')
const { ParameterizedContext } = require('koa')

class UserController{
    /**
     * Register Handler
     * @param {ParameterizedContext} ctx 
     */
    static async register(ctx){
        const { email, username, password } = ctx.request.body

        const hash = await hashPassword(password)

        const res = await User.findOrCreate({ 
            where : {
                [Op.or] : [{ username }, { email }]
            },
            defaults : {
                email, 
                username, 
                password : hash 
            }
        })

        const token = generateURLSafeRandom()
        await UserEmailVerification.create({ UserId : res.id, token })

        await mailer.sendMail({
            from : 'Regan <regan@mail.cruncher.xyz>',
            to : email,
            subject: "Verify your WLB BE Account",
            text: `To complete the registration of your account, please go to cruncher.xyz/verify?token=${token}`,
        })

        // console.log('token is ', token)

        ctx.status = 201
        ctx.body = { 
            status : "User Created"
        }
    }

    /**
     * Login Handler
     * @param {ParameterizedContext} ctx 
     */
    static async login(ctx){
        const { username, password } = ctx.request.body

        const user = await User.findOne({
            where : {
                username
            }
        })

        if(!user){
            ctx.throw(400, 'Username/Password combination not found')
        }

        let isPasswordCorrect
        try{
            isPasswordCorrect = await verifyPassword(user.password, password)
        } catch (e){
            ctx.throw(400, 'Username/Password combination not found')
        }

        if(!isPasswordCorrect){
            ctx.throw(400, 'Username/Password combination not found')
        }

        const token = encodeJwt({
            id : user.id,
            email : user.email
        })

        ctx.response.body = {
            token_type : "bearer",
            access_token : token
        }
    }

    /**
     * Email Verification Handler
     * @param {ParameterizedContext} ctx 
     */
    static async verify(ctx){
        const { token } = ctx.request.query
        if(!token){
            ctx.throw(400, 'Token not Provided')
        }

        const uev = await UserEmailVerification.findOne({
            where : {
                token
            }
        })

        if(!uev){
            ctx.throw(400, 'Invalid Token')
        }

        await User.update({
            isVerified : true
        }, {
            where : {
                id : uev.UserId,
            }
        })
        
        await uev.destroy()

        ctx.body = {
            message : 'User Verified'
        }
    }
}

module.exports = UserController
