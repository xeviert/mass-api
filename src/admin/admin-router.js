const express = require('express')
const AdminService = require('./admin-service')
const { requireAuth } = require('../middleware/jwt-auth')

const adminRouter = express.Router()

adminRouter
    .route('/orders')
    .get((req, res, next) => {
        AdminService.getAllOrders(req.app.get('db'))
            .then(orders => {
                res.json(orders)
            })
            .catch(next)
    })

adminRouter
    .route('/orders/:id')
    .all((req, res, next) => {
        AdminService.getById(req.app.get('db'), req.params.id)
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
        AdminService.deleteOrder(
            req.app.get('db'), 
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = adminRouter