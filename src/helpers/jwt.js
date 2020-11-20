const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

function encodeJwt(payload){
    return jwt.sign(payload, JWT_SECRET)
}

function verifyJwt(token){
    return jwt.verify(token, JWT_SECRET)
}

module.exports = { encodeJwt, verifyJwt }
