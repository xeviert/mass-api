# MASS API - Mutual Aid & Shared Services

## Created for MASS Client
## Live App: https://mass-client.vercel.app
## Client Repo: https://github.com/xeviert/mass-client


### Full Stack Application using Express, Knex, NodeJS, and React.

### Description

This project is for the use of a mutual aid organization. Mutual aid is direct, neighbor-to-neighbor rather than having a large organization as a barrier between people who have things to offer and people who have things they need. It is based on the equality of giving and receiving and recognizes that everyone at some point is able to offer help of some kind and will need to receive it.

Anyone can go to the website and look at a collection of useful public resources that may help those in need. It links to other mutual aid organizations as well as community fridges, shelters, and domestic abuse resources.

User registers with phone number and password only. This prevents user from giving out personal details and keeping the user as anonymous as possible. Once logged in, the user is able to submit a list of things needed as well as a location of where the mutual aid organization is to drop off the items submitted.

If admin is logged in, admin will be able to see a list of orders with the items requested from different users.

---

### API ENDPOINTS

```
/api/auth/token
-- POST - login user

// req.body
  {
    username: String,
    password: String
  }

// res.body
  {
    authToken: String
  }



/api/user
-- POST - register/create a user

  {
    phone_number: String,
    password: String
  }



/api/orders
-- POST - creates a new order and adds it to order and order_items table 

// req.body
  {
    "location": String,
    "order_items": {
        String: Int,
        String: Int
    }
  }

// example
  {
    "location": "123 Fake St.",
    "order_items": {
        "5": 2,
        "2": 7
    }
  }



/api/admin
-- GET - get all orders from all users
```

This is the server side of MASS API. I used Node/Express to build the API. PostgreSQL/Knex was used for the database.