const mongoose = require('mongoose')
const Category = require('./category')
const Product = require('./products') 

const offerSchema = new mongoose.Schema({
  applicableProduct:{
    type:String,
    ref:Product
  },
  applicableCategory:{
    type:String,
    ref:Category,
  },
  discount:{
    type:Number,
    required:true
  },
  expiryDate:{
    type:Date,
    required:true,
  },
  isActive:{
    type:Boolean,
    default:true,
  }
})
const Offer = mongoose.model("Offers",offerSchema)
module.exports = Offer;