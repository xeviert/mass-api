const express = require('express')
const AdminService = require('./admin-service')
const { requireAuth } = require('../middleware/jwt-auth')

const adminRouter = express.Router()

adminRouter
    .route('/orders')
    .get((req, res, next) => {
        // gets all wishlist orders from admin
        AdminService.getAllOrders(req.app.get('db'))
            .then(orders => {
                res.json(orders)
            })
            .catch(next)
    })

adminRouter
    .route('/orders/:order_id')
    .all((req, res, next) => {
        AdminService.getById(req.app.get('db'), req.params.note_id)
            .then((order) => {
                if (!order) {
                    return res.status(404).json({
                        error: { message: `Order doesn't exist` },
                    })
                }
                res.order = order
                next()
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        AdminService.deleteOrder(req.app.get('db'), req.params.order_id)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = adminRouter