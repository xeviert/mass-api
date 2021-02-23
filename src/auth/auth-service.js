const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config')

const AuthService = {
    getUserWithPhoneNumber(db, phone_number) {
        return db('users')
            .where({ phone_number })
            .first()
    },

    comparePasswords(password, hash) {
        return bcrypt.compare(password, hash)
    },

    createJwt(subject, payload) {
        return jwt.sign(payload, config.JWT_SECRET, {
            subject,
            expiresIn: config.JWT_EXPIRY,
            algorithm: 'HS256',
        })
    },

    verifyJwt(token) {
        return jwt.verify(token, config.JWT_SECRET, {
            algorithms: ['HS256'],
        })
    },
}

module.exports = AuthService