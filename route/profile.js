const express = require('express')
const users = require('../model/users')
const router = express.Router()
const profilecontroller = require('../controller/profilecontroller')

router.get('/userProfile',profilecontroller.userProfile)

router.get('/editProfile',profilecontroller.editProfileget)

router.post('/editUser/:id',profilecontroller.editUserpost)

router.get('/changePassword',profilecontroller.changePasswordget)

router.post('/userchangePassword',profilecontroller.userchangePassword)

router.get('/addAddress',profilecontroller.addAddressget)

router.post('/submitAddress',profilecontroller.submitAddress)

router.get('/viewAddress',profilecontroller.getviewAddress)

router.get('/deleteadd/:id',profilecontroller.deleteadd)

router.get('/updateadd/:id',profilecontroller.updateaddget)

router.post('/editAddresspost/:id',profilecontroller.updateaddpost)

router.get('/walletHistory',profilecontroller.walletHistory)


module.exports = router;