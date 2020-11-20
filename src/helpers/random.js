const { default: base64url } = require('base64url')
const crypto = require('crypto')

function generateURLSafeRandom(len = 64){
    return base64url(crypto.randomBytes(len))
}

module.exports = { generateURLSafeRandom }
