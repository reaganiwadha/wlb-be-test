/**
 * @typedef {import("koa").ParameterizedContext} ParameterizedContext
 */


const { isEmail } = require('validator').default
/**
 * 
 * @param {ParameterizedContext} ctx 
 * @param {*} next 
 */
async function validateRegister(ctx, next){
    if(!ctx.request.body){
        ctx.throw(400, 'Invalid Body')
    }

    const { email, password, username } = ctx.request.body

    if(!isEmail(email)){
        ctx.throw(400, 'Invalid Email')
    }

    return await next()
}


module.exports = { validateRegister }