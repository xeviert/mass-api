const OrdersService = {
    getAllOrders(db) {
        return db('orders')
            .select('*')
            .from('favors')
    },

    insertOrder(db, newOrder) {
        return db
            .insert(newOrder)
            .into('orders')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    serializeOrder(order) {
        return {
            order_id: order.order_id,
            
        }
    }
}