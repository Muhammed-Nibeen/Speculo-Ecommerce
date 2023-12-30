const express = require('express')
const app = express();
const morgan = require('morgan');
// const userrouter = require('./controller/usercontroller')
// const adrouter = require('./controller/admincontroller')
// const carouter = require('./controller/cartcontroller')
const user = require('./route/user')
const admin = require('./route/admin')
const cart = require('./route/cart')
const product = require('./route/product')
const category = require('./route/category')
const profile = require('./route/profile')
const order = require('./route/order')
const coupon = require('./route/coupon')
const offer = require('./route/offer')
const mongo = require('./mongo') 
const port = 1000
const session = require("express-session")
const nocache = require("nocache")
const {v4:uuidv4} = require("uuid");

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.set('view engine','ejs')

app.use(express.static('public'))
// app.use(express.urlencoded({extended:false}))
app.use(morgan('tiny'))
app.use('/',user)
app.use('/',admin)
app.use('/',cart)
app.use('/',product)
app.use('/',category)
app.use('/',profile)
app.use('/',order)
app.use('/',coupon)
app.use('/',offer)
app.use(nocache())
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.listen(port,()=>{
  console.log(`http://localhost:${port}`)
})
