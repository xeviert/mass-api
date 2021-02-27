const express = require("express");
const path = require("path");
const OrdersService = require("./orders-service");
const xss = require("xss");
const { requireAuth } = require("../middleware/jwt-auth");

const ordersRouter = express.Router();
const jsonBodyParser = express.json();

const serializeOrder = (order) => ({
  id: order.id,
  posted: order.posted,
  location: xss(order.location),
});

ordersRouter
  .route("/")
  .post(requireAuth, jsonBodyParser, async (req, res, next) => {
    // Made this post request async so I can use await when I insert data into orders table and order_items table at the same time.
    const { location, order_items } = req.body;
    const newOrder = { location };

    for (const [key, value] of Object.entries(req.body)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing ${key} in request body` },
        });
      }
    }

    newOrder.user_id = req.user.id;
    let order_id;
    // This first part puts in data into the order table

    try {
      const order = await OrdersService.insertOrder(req.app.get("db"), newOrder)
        .then((order) => {
          res
            .status(201)
            .location(path.posix.join(req.originalUrl + `/${order.id}`))
            .json(serializeOrder(order));
          // order_id = order.id sends back the order id so I can use it in the order_items table
          order_id = order.id;
        })
        .catch((e) => {
          next(e);
        });

      // this for loop part accepts an object of data since the user might one item or multiple items to order
      for (const [key, value] of Object.entries(order_items)) {
        let orderObject = {
          order_id: order_id,
          item_id: parseInt(key),
          quantity: value,
        };

        // insert into order_items table
        await OrdersService.insertOrderItems(req.app.get("db"), orderObject)
          .then(() => {
            res.status(201).send("order submitted");
          })
          .catch((e) => {
            next(e);
          });
      }
    } catch (error) {
      next(error);
    }
  });

module.exports = ordersRouter;
