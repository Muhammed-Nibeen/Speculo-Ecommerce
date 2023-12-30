const express = require('express')
const users = require('../model/users')
const router = express.Router()
const productcontroller = require('../controller/productcontroller')
const path = require('path')

//code for multer
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage }).array('img',4)



router.get('/addproduct',productcontroller.addProduct)

router.post('/adpostProduct',upload,productcontroller.adpostProduct)

router.get('/viewProduct',productcontroller.viewproductlist)

router.get('/productupdate/:id',productcontroller.updatepro)

router.post('/postUpPro/:id',upload,productcontroller.updatepropost)

router.get('/deleteproduct/:id',productcontroller.deleteProduct)

router.get('/listproduct/:id',productcontroller.listProduct)

module.exports = router;