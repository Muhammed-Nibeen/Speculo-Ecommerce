const mongoose = require("mongoose")
const returnSchema = new mongoose.Schema({
  userid:{
    type:mongoose.Schema.Types.ObjectId,
  },
  reason:{
    type:String
  },
  product:{
    type:String
  },
  amount:{
    type:Number
  },
  productid:{
    type:mongoose.Schema.Types.ObjectId,
  },
  orderid:{
    type:mongoose.Schema.Types.ObjectId,
  }
})
const Return = mongoose.model('returnorders',returnSchema)
module.exports=Return