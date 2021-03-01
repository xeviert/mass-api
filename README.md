# MASS API

## Created for [MASS Client](https://mass-client.vercel.app)

### Full Stack Application using Express, Knex, NodeJS, and React.

---

### API ENDPOINTS

```
/api/auth/token
-- POST - login user

/api/user
-- POST - register/create a user

/api/orders
-- POST - creates a new order and adds it to order and order_items table 

/api/admin
-- GET - get all orders from all users
```

This is the server side of MASS API. I used Node/Express to build the API. PostgreSQL/Knex was used for the database.