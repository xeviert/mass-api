const express = require('express')
const path = require('path')
const OrdersService = require('./orders-service')
const xss = require('xss')
const { requireAuth } = require('../middleware/jwt-auth')

const ordersRouter = express.Router()
const jsonBodyParser = express.json()

const serializeOrder = (order) => ({
    id: order.id,
    posted: order.posted,
    location: xss(order.location)
})

ordersRouter
    .route('/')
    .post(requireAuth, jsonBodyParser, async (req, res, next) => {
        const { location, quantity, order_items } = req.body
        const newOrder = { location }

        for (const [key, value] of Object.entries(newOrder)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body` }
                })
            }
        }

        newOrder.user_id = req.user.id
        let order_id;
        console.log(order_items)

        const order = await OrdersService.insertOrder(
            req.app.get('db'),
            newOrder
            )
            .then((order) => {
                res
                .status(201)
                .location(path.posix.join(req.originalUrl + `/${order.id}`))
                .json(serializeOrder(order))
                order_id = order.id
            })
            .catch((e) => {
                next(e)
        })

        for (const [key, value] of Object.entries(order_items)) {
            let orderObject =  {
                order_id: order_id,
                item_id: parseInt(key),
                quantity: value
            }
            console.log(orderObject)
            
            await OrdersService.insertOrderItems(
                req.app.get('db'),
                orderObject
                )
                .catch(next)
        }

        res
            .status(201)
            .send('order submitted')
    })
            
module.exports = ordersRouter