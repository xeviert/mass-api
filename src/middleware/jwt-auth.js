const { JsonWebTokenError } = require('jsonwebtoken')
const AuthService = require('../auth/auth-service')

async function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || ''

    let bearerToken
    if (!authToken.toLowerCase().startsWith('bearer')) {
        return res.status(401).json({ error: 'Missing bearer token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)

        const user = await AuthService.getUserWithPhoneNumber(
            req.app.get('db'),
            payload.sub,
        )

        if (!user)
            return res.status(401).json({ error: 'Unauthorized request'})

        next(error)
    }
}

module.exports = { requireAuth }