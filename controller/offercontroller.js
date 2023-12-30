const express = require('express');
const users = require('../model/users');
const router = express.Router();
const Category = require('../model/category')
const Product = require('../model/products')
const Offer = require('../model/offer')
const path = require('path')

const addOffer = async(req,res)=>{
  if(req.session.addata){
    try{
      const categorylist = await Category.find()
      const productlist = await Product.find()
      console.log("productlist: ",productlist);
      res.render('addOffer',{Categories:categorylist,Products:productlist})
    }catch(err){
      console.log(err)
    }
  }else{
    res.redirect('/admin')
  }
}

const offerview = async(req,res)=>{
  if(req.session.addata){
    const offerdata = {
      applicableProduct:req.body.product,
      applicableCategory:req.body.category,
      discount:req.body.discount,
      expiryDate:req.body.expirydate,
    }
    console.log("offerdata: ",offerdata);
    await Offer.insertMany([offerdata])
    .then(x=>{
      console.log('inserted')
    })
    res.redirect('/viewOffer')
  }else{
    res.redirect('/admin')
  }
}

const viewOffer = async(req,res)=>{
  if(req.session.addata){
    try{
      const page = parseInt(req.query.page) || 1;
      const limit = 3; // Set the number of products per page
      const skip = (page - 1) * limit;
  
      const totalProducts = await Offer.countDocuments();
      const totalPages = Math.ceil(totalProducts / limit);
      const currentPage = page > totalPages ? totalPages : page;
  
      const offerlist = await Offer.find({}).populate('applicableCategory')
        .skip(skip)
        .limit(limit);
      // const offerlist = await Offer.find({}).populate('applicableCategory')
      res.render('viewOffer',{offerlist,totalPages,currentPage,limit})
    }catch(err){
      console.log(err)
    }
  }else{
    res.redirect('/admin')
  }
}

module.exports = {
  addOffer,
  offerview,
  viewOffer
}