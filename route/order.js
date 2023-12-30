const express = require('express')
const users = require('../model/users')
const router = express.Router()
const ordercontroller = require('../controller/ordercontroller')

const multer = require('multer');
const upload = multer();

router.get('/showOrder',ordercontroller.showOrderget)
router.post('/cancelord/:id',ordercontroller.cancelorderget)

//for admin
router.post('/adorderpost/:id/:productid',ordercontroller.adorderpost)

router.get('/viewMore/:id/:productid/:proid',ordercontroller.viewMore)
// to store reason
router.post('/storeReason/:id/:pid',ordercontroller.storeReason)
//to get invoice
router.get("/invoice/:id/:productid",ordercontroller.getInvoice)

router.post('/submitReturn/:orderId',upload.none(),ordercontroller.returnorder)

router.post('/placeOrderWithWallet',ordercontroller.walletpay)

router.get('/confirmOrder',ordercontroller.confirmOrder)

module.exports = router;