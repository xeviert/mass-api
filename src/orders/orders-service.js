const OrdersService = {

    getAllOrders(db) {
        return db('orders')
            .select('*')
            .from('favors')
    },

    insertOrder (db, newOrder) {
        return db
            .insert(newOrder)
            .into('orders')
            .returning('*')
            .then(rows => {
                return rows[0]
            })

    },

    insertOrderItems(db, item) {
        return db
            .insert(item)
            .into('order_items')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    
}

module.exports = OrdersService