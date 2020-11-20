const { model } = require("mongoose")

const Log = model('Log', {
    path : String,
    request : String,
    response : String,
    timestamp : Date,
    responseTime : Number
})

module.exports = Log
