const express = require('express')
const path = require('path')
const { requireAuth } = require('../middleware/jwt-auth')

const ordersRouter = express.Router()
const jsonBodyParser = express.json()

const serializeOrder = (order) => ({
    /**
     * id: order.id,
     * user: order.user
     * details: xss(order.details),
     * 
     * 
     * will have to npm i xss 
     * 
     */
})

ordersRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        const { /* input variables */ } = req.body
        const newOrder = { /* input variables */}

        for (const [key, value] of Object.entries(newOrder)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body` }
                })
            }
        }

        OrdersService.insertOrder(req.app.get('db'), newOrder)
            .then((note) => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${order.id}`))
                    .json(serializeOrder(order))
            })
            .catch((e) => {
                next(e)
                console.log(e)
            })
    })

module.exports = ordersRouter