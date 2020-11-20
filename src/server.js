if(process.env.NODE_ENV === 'development'){
    require('dotenv').config()
}

const PORT = process.env.PORT || 3000

const Koa = require('koa')
const devLogger = require('koa-logger')
const bodyParser = require('koa-bodyparser')

const appRouter = require('./routes')
const logging = require('./middlewares/logging')
const connectMongo = require('./config/mongoose')
const errorHandler = require('./middlewares/errorHandler')

connectMongo()

const app = new Koa()

app.use(bodyParser())
app.use(devLogger())
app.use(errorHandler)
app.use(logging)
app.use(appRouter.routes())

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})
