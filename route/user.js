const express = require('express');
const nocache = require('nocache')
const router = express.Router();
const usercontroller =  require('../controller/usercontroller');
const users = require('../model/users');
router.use(nocache())

router.use(express.static('public'))
router.use(express.urlencoded({extended:false}))

const checkSessionAndBlocked = async(req, res, next)=>{
  if(req.session.data){
    const userDetails = await users.findOne({email: req.session.data.email})
    if(userDetails && !userDetails.isBlocked){
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

//Role based implementation of Api
const authorize = async(req, res, next)=>{
  const userRole = await users.findOne()
  if(userRole.role === true){
    next();
  }else{
    res.redirect("/")
  }
}

router.get('/',usercontroller.home)

// router.get('/userLogin',usercontroller.userLogin)

router.get('/UserHome', checkSessionAndBlocked,usercontroller.userHome)

//Route to user login 
router.get('/login',authorize,usercontroller.login)

//database connection
router.post('/register',usercontroller.register)

//userLogin
router.post("/Login",usercontroller.userLogin)

//implementing session for user

router.get('/userHome',usercontroller.userSession)

//route for logout

router.get('/userLogout',usercontroller.userLogout)

router.get('/reregis',usercontroller.reregis)

router.post('/reotp',usercontroller.reotp)

router.post('/otpVerify',usercontroller.otpVerify)

router.get('/viewfulldetails/:id',checkSessionAndBlocked, usercontroller.viewfulldetails)

router.get('/shop2',checkSessionAndBlocked, usercontroller.showshops)

router.get('/forgotPassword', usercontroller.forgotPassword)

router.post('/otpForgotPassword',usercontroller.otpForgotPassword)

router.post('/otpVerifyPassword',usercontroller.otpVerifyPassword)

router.post('/newPassword',usercontroller.newPassword)

router.get('/filterCat',usercontroller.filterCat)

// router.get('/filter',usercontroller.filterShop)

// router.get('/search',usercontroller.searchGet)

router.get('/viewdetails/:id',checkSessionAndBlocked, usercontroller.viewdetails)


router.get('/viewdetail/:id',checkSessionAndBlocked, usercontroller.viewdetail)

module.exports = router;