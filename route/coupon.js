const express = require('express')
const users = require('../model/users')
const router = express.Router()
const couponcontroller = require('../controller/couponcontroller')

router.get('/addcoupon',couponcontroller.getCoupon)

router.post('/adpostCoupon',couponcontroller.addCoupon)

router.get('/viewCoupon',couponcontroller.getviewCoupon)

router.post('/couponcheck',couponcontroller.couponcheck)





module.exports = router; 