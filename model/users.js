const mongoose = require('mongoose')

const userschema = new mongoose.Schema({
  firstname:{
    type:String,
  },
  lastname:{
    type:String,
  },
  email:{
    type:String,
  },
  password:{
    type:String,
  },
  isBlocked:{
    type:Boolean,
  },
  wallet:{
    type:Number,
    default: 0
  },
  role:{
    type:Boolean,
    default: true
  },
  referalcode:{
    type:String
  },
  referallink:{
    type:String
  }
})
const users = mongoose.model('users1',userschema)
module.exports = users 