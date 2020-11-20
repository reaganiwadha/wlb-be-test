// Main Router

const authenticated = require('../middlewares/auth')
const UserController = require('../controllers/UserController')
const PostController = require('../controllers/PostController')
const { validateRegister } = require('../validation/auth')
const Router = require('koa-router')
const r = new Router()

r.post('/register', validateRegister, UserController.register)
r.post('/login', UserController.login)
r.get('/verify', UserController.verify)

const protected = new Router()

protected.use(authenticated)
protected.get('/posts', PostController.getPosts)
protected.get('/posts/:id', PostController.getPostById)
protected.post('/posts', PostController.createPost)
protected.delete('/posts/:id', PostController.deletePost)
protected.post('/posts/:id/like', PostController.likePost)
protected.post('/posts/:id/unlike', PostController.unlikePost)
protected.post('/posts/:id/comments', PostController.commentPost)
protected.post('/posts/:id/comments/:comment_id', PostController.commentPost)
protected.put('/posts/:id', PostController.editPost)
protected.delete('/posts/:post_id/comments/:comment_id', PostController.deleteComment)

r.use(protected.routes())

module.exports = r
