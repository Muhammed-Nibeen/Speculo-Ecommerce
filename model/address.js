const mongoose = require("mongoose")

const addressschema = new mongoose.Schema({
  userid:{
    type:mongoose.Schema.Types.ObjectId
  },
  firstname:{
    type:String
  },
  lastname:{
    type:String
  },
  address:{
    type:String
  },
  city:{
    type: String
  },
  state:{
    type: String
  },
  pincode:{
    type: String
  },
  phone: {
    type:Number
  }
})
const addressCollection = mongoose.model('useraddress',addressschema)
module.exports=addressCollection