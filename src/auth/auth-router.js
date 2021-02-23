const express = require('express')
const AuthService = require('./auth-service')
const { requireAuth } = require('../middleware/jwt-auth')

const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter
    .route('/token')
    .post(jsonBodyParser, async (req, res, next) => {
        const { phone_number, password } = req.body
        const loginUser = { phone_number, password }

        for (const [key, value] of Object.entries(loginUser))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
                
        try {
            const dbUser = await AuthService.getUserWithPhoneNumber(
                req.app.get('db'),
                loginUser.phone_number
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

            const sub = dbUser.phone_number
            const payload = {
                user_id: dbUser.id,
                phone_number: dbUser.phone_number
            }
            res.send({
                authToken: AuthService.createJwt(sub, payload),
            })
        } catch (error) {
            next(error)
        }
    })

    .put(requireAuth, (req, res) => {
        const sub = req.users.phone_number
        const payload = {
            user_id: req.users.id,
            phone_number: req.users.phone_number,        
        }
        res.send({
            authToken: AuthService.createJwt(sub, payload)
        })
    })

module.exports = authRouter