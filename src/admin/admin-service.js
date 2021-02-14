const AdminService = {
    getAllOrders(db) {
        return db
            .select('*')
            .from('orders')
    },

    getById(db, id) {
        return db
            .from('orders')
            .select('*')
            .where('id', id)
            .first()
    },

    deleteOrder(db, id) {
        return db('orders')
            .where({ id })
            .delete()
    }
}

module.exports = AdminService