const { verifyJwt } = require('../helpers/jwt')
const { User } = require('../models')

const { ParameterizedContext, Next } = require('koa')

/**
 * Main Authentication Middleware
 * @param {ParameterizedContext} ctx 
 * @param {Next} next
 */
async function authMiddleware(ctx, next){
    if(!ctx.headers.authorization){
        ctx.throw(401, 'Token not provided')
    }

    const token = ctx.headers.authorization.split('Bearer ')
    if(!token[1]){
        ctx.throw(401, 'Token not provided')
    }

    const payload = verifyJwt(token[1])

    if(!payload){
        ctx.throw(401, 'Invalid Token')
    }

    const user = await User.findOne({
        where : {
            email : payload.email
        }
    })

    if(!user){
        ctx.throw(401, 'Invalid Token')
    }

    if(!user.isVerified){
        ctx.throw(401, 'Account has not been activated')
    }

    ctx.user = user

    await next()
}

module.exports = authMiddleware
