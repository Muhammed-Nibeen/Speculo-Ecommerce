const mongoose = require("mongoose")
const cartSchema = new mongoose.Schema({
  userid: {
    type:mongoose.Schema.Types.ObjectId
  },
  user:{
    type: String
  },
  productid:{
    type:mongoose.Schema.Types.ObjectId
  },
  product: {
    type:String
  },
  price: {
    type:Number
  },
  total:{
    type:Number
  },
  quantity:{
    type:Number
  },
  image:[{
    type:String
  }]
})

const cartCollection = mongoose.model("cart",cartSchema)
module.exports = cartCollection