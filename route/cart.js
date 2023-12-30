const express = require('express')
const users = require('../model/users')
const router = express.Router()
const cartcontroller = require('../controller/cartcontroller')
const session = require("express-session")
router.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));
const nocache = require("nocache");
router.use(nocache());


const checkSessionAndBlocked = async(req, res, next)=>{
  if(req.session.data){
    const userDetails = await users.findOne({email: req.session.data.email})
    if(!userDetails.isBlocked){
      next();
    }else{
      //The user is blocked destroy session and redirect
      req.session.destroy((err)=>{
        if(err){
          console.log("Error destroying session: ",err)
          res.redirect("/")
        }else{
          res.redirect('/')
        }
      })
    }
  }else{
    res.redirect('/')
  }
}

router.get('/cart',checkSessionAndBlocked,cartcontroller.getcart)

router.get('/addtocart/:id',cartcontroller.getAddCart)

router.get('/removefromcart/:id',cartcontroller.getRemoveCart)

router.get('/addcartquantity/:id',cartcontroller.getAddQuantity)

router.get('/subcartquantity/:id',cartcontroller.getSubQuantity)
 
router.get('/checkout',cartcontroller.getcheckout)

router.post('/checkedout',cartcontroller.postCheckedout)

router.post('/razorpayment',cartcontroller.razorpost)




module.exports = router;