const Log = require('../mongooseModels/Log')

async function loggingMiddleware(ctx, next){
    const start = Date.now()

    try{
        await next()
    } catch (e){
        throw e
    }

    const log = new Log({
       path : ctx.path,
       request : JSON.stringify(ctx.request.body),
       response : JSON.stringify(ctx.response.body),
       timestamp : new Date(),
       responseTime : Date.now() - start
    })

    await log.save()
    console.log(log)
}

module.exports = loggingMiddleware