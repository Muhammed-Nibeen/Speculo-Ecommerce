const express = require('express');
const adrouter = express.Router();
const admincontroller =  require('../controller/admincontroller');
const users = require('../model/users');
const path = require('path')
const nocache=require('nocache')

adrouter.use(nocache())

//code for admin authorization middleware
const isAdmin = (req,res,next)=>{
  if(req.session.addata){
    return next();
  }else{
    res.redirect('/admin')
  }
}


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



adrouter.get('/admin',admincontroller.admin)

adrouter.get('/adminhome',admincontroller.data)

adrouter.post('/adminlogin',admincontroller.adminLogin)

adrouter.get('/adminHome',isAdmin,admincontroller.adminDash)

adrouter.get('/adminLogout',admincontroller.adminLogout)

adrouter.get('/blockuser/:id',isAdmin,admincontroller.blockUser)

adrouter.get('/dashUsers',isAdmin,admincontroller.dashUsers)

adrouter.post('/remove-image',isAdmin,admincontroller.deleteimg)

adrouter.get('/adminOrder',isAdmin,admincontroller.adminOrderget)

adrouter.get('/salesReport',isAdmin,admincontroller.salesReportget)

adrouter.get('/excelReport',isAdmin,admincontroller.salesReport)

adrouter.get('/generate-pdf',isAdmin,admincontroller.pdfreport)

adrouter.get('/adviewMore/:userid/:productid',isAdmin,admincontroller.adviewMore)

module.exports = adrouter;