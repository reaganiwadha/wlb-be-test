async function errorHandler(ctx, next){
    await next().catch(err => {
        const { statusCode, message } = err

        ctx.type = 'json'
        ctx.status = statusCode || 500
        ctx.body = {
            status : 'error',
            message
        }

        ctx.app.emit('error', err, ctx)
    })
}

module.exports = errorHandler