const mongoose = require('mongoose')
const Category = require('./category')
const ProductSchema = new mongoose.Schema({
  Productname:{
    type:String,
    required:true
  },
  Category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:Category,
    required:true
  },
  Price:{
    type:Number,
    required:true
  },
  Stock:{
    type:Number,
    required:true
  },
  Model:{
    type:String,
    required:true
  },
  Description:{
    type:String,
    required:true
  },
  Image:[String],
  isListed:{
    type: Boolean,
    default: true
  }
})
const Product = mongoose.model('products',ProductSchema)

module.exports = Product