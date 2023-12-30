const mongoose = require("mongoose")
const reasonSchema = new mongoose.Schema({
  userid:{
    type:mongoose.Schema.Types.ObjectId,
  },
  orderid:{
    type:mongoose.Schema.Types.ObjectId,
  },
  productid:{
    type:mongoose.Schema.Types.ObjectId,
  },
  reason:{
    type:String
  }
})

const Reason = mongoose.model('reason',reasonSchema)

module.exports = Reason