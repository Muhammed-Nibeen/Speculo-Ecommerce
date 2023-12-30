const express = require('express');
const app = express();
const Coupon = require('../model/coupon')
app.use(express.json());
const getCoupon = (req,res)=>{
  try{
    res.render('coupon')
  }catch(err){
    console.log(err);
  }
}

const addCoupon =async(req,res)=>{
  if((req.body.couponcode===null || req.body.couponcode.trim() === "")||(req.body.discount===null || req.body.discount.trim() === "")||(req.body.expirydate===null || req.body.expirydate.trim() === "")||(req.body.purchaseamount===null || req.body.purchaseamount.trim() === "")){
    res.render('coupon',{message:"Fields must be filled"})
  }else if(req.session.addata){
    const coup = {couponcode:req.body.couponcode}
    const couponcode = req.body.couponcode
    const isPresent = await Coupon.findOne({ couponcode : {$regex: new RegExp('^'+couponcode+'$','i') }}) 
    if(isPresent === null) {
      const coupondata ={
        couponcode:req.body.couponcode,
        discount:req.body.discount,
        expirydate:req.body.expirydate,
        purchaseamount:req.body.purchaseamount
      }
      console.log(coupondata)
      await Coupon.insertMany([coupondata])
      .then(x=>{
        console.log('inserted')
      })
      res.redirect('/viewCoupon')
    }else{
      res.render('coupon',{message:"Already exist"})
    }
    }else{
    res.redirect('/admin',302)
  }
}

const getviewCoupon = async(req,res)=>{
  if(req.session.addata){
    try{
      const page = parseInt(req.query.page) || 1;
      const limit = 3; // Set the number of products per page
      const skip = (page - 1) * limit;
  
      const totalProducts = await Coupon.countDocuments();
      const totalPages = Math.ceil(totalProducts / limit);
      const currentPage = page > totalPages ? totalPages : page;
  
      const couponlist = await Coupon.find()
        .skip(skip)
        .limit(limit);

      // const couponlist = await Coupon.find()
      res.render('viewCoupon',{couponlist,totalPages,currentPage,limit})
    }catch(err){
      console.log(err)
    }
  }else{
    res.redirect('/admin')
  }
}

const couponcheck = async(req,res) =>{
  try {
    console.log('enter the controller');
    let currentDate = new Date();
    const couponcode = req.body.Couponcode;
    console.log("couponcode: ",couponcode)
    if (req.session.coupon && couponcode.toLowerCase() === req.session.coupon.toLowerCase()) {
        return res.status(400).json({
            success: false,
            message: 'Coupon code has already been applied.',
        });
    }
    const coupon = await Coupon.findOne({ couponcode: { $regex: new RegExp(couponcode, 'i') } });
    console.log(coupon)
    if(coupon && coupon.couponcode === couponcode){
      if (coupon && coupon.expirydate > currentDate && couponcode.toLowerCase() === coupon.couponcode.toLowerCase()) {
    
        const discountAmount = coupon.discount;
        console.log(discountAmount);
        const amountLimit = coupon.purchaseamount;
        req.session.coupon = coupon.couponcode;

        return res.json({ success: true, discount: discountAmount, amount: amountLimit });
      }else{
        return res.status(404).json({
            success: false,
            message: ' coupon code expired.',
        });
      }
    }else{
      return res.status(400).json({
        success:false,
        message: 'Invalid coupon'
      })
    }
   } catch (error) {
    console.error('Error in couponcheck:', error);
    return res.status(500).json({
        success: false,
        message: 'Internal server error during coupon validation.',
    });
}
}




module.exports = {
  getCoupon,
  addCoupon,
  getviewCoupon,
  couponcheck
}