const mongoose = require('mongoose')

const categoryschema = new mongoose.Schema({
  category:{
    type:String
  }
})
const Category = mongoose.model('Category1',categoryschema)
module.exports = Category