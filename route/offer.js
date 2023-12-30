const express = require('express')
const router = express.Router()
const offercontroller = require('../controller/offercontroller')

router.get('/addOffer',offercontroller.addOffer)

router.post('/offerPost',offercontroller.offerview)

router.get('/viewOffer',offercontroller.viewOffer)

module.exports = router;