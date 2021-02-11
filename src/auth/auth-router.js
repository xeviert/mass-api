const express = require('express')
const AuthService = require('./auth-service')

const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter

module.exports = authRouter