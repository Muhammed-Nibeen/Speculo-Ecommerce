const mongoose = require('mongoose')

const couponSchema =new mongoose.Schema({
  couponcode:{
    type:String
  },
  discount:{
    type:Number 
  },
  expirydate:{
    type:Date
  },
  purchaseamount:{
    type:Number
  }
})

const Coupon = new mongoose.model("coupon",couponSchema)
module.exports = Coupon