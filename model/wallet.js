const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
  userid:{
    type:mongoose.Schema.Types.ObjectId,
  },
  date:{
    type:Date
  },
  amount:{
    type:Number
  },
  creditordebit:{
    type:String
  },
  type:{
    type:String
  }
})

const Wallet = new mongoose.model("wallet",walletSchema)
module.exports = Wallet