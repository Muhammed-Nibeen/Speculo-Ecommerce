const mongoose = require("mongoose")
require('dotenv').config();
mongoose.connect(process.env.STR
)
.then(()=>{
  console.log("mongodb connected")
})
.catch(()=>{
  console.log("Failed to connect")
})