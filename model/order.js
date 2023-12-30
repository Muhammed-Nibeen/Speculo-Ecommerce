const mongoose = require('mongoose')

const orderschema = new mongoose.Schema({
    userid:{
      type:mongoose.Schema.Types.ObjectId,
    },
    firstname:{
      type:String
    },
    productcollection: [
      {
        productid:{
          type:mongoose.Schema.Types.ObjectId,
        },
        productname:{
          type:String
        },
        quantity:{
          type:String
        },
        price:{
          type:String
        },
        status:{
          type:String
        }
      }
    ],
    orderdate:{
      type:Date
    },
    address:{
      type:String
    },
    paymentmode:{
      type:String
    },
})

const order = mongoose.model("orders",orderschema)
module.exports = order;