const express = require('express')
const AuthService = require('./auth-service')
const { requireAuth } = require('../middleware/jwt-auth')

const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter
    .route('/token')
    .post(jsonBodyParser, async (req, res, next) => {
        const { phoneNumber, password } = req.body
        const loginUser = { phoneNumber, password }

        for (const [key, value] of Object.entries(loginUser))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
                
        try {
            const dbUser = await AuthService.getUserWithPhoneNumber(
                req.app.get('db'),
                loginUser.username
            )

            if (!dbUser)
                return res.status(400).json({
                    error: 'Incorrect username or pw',
                })

            const compareMatch = await AuthService.comparePasswords(
                loginUser.password,
                dbUser.password
            )

            if (!compareMatch)
                return res.status(400).json({
                    error: 'Incorrect username or pw',
                })

            const sub = dbUser.phoneNumber
            const payload = {
                user_id: dbUser.id,
                phoneNumber: dbUser.phone_number
            }
            res.send({
                authToken: AuthService.createJwt(sub, payload),
            })
        } catch (error) {
            next(error)
        }
    })

    .put(requireAuth, (req, res) => {
        const sub = req.user.phone_number
        const payload = {
            user_id: req.user.id,
            phoneNumber: req.user.phone_number,        
        }
        res.send({
            authToken: AuthService.createJwt(sub, payload)
        })
    })

module.exports = authRouter