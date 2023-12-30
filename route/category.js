const express = require('express');
const router = express.Router();
const categorycontroller =  require('../controller/categorycontroller');
const users = require('../model/users');
const path = require('path')
const nocache=require('nocache')

router.get('/adCategory',categorycontroller.disCategory)

router.post('/catpost',categorycontroller.categorypost)

router.get('/disviewcat',categorycontroller.disviewcategory)

router.get('/viewcategory',categorycontroller.viewcategory)

router.get('/updatecategory/:id',categorycontroller.updatecat)

router.post('/updatecatpost/:id',categorycontroller.categoryupdatepost)

router.get('/deletecategory/:id',categorycontroller.deletecategory)

module.exports = router;