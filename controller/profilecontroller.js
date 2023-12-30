const express = require('express');
const { collection } = require('../model/users');
const users = require('../model/users');
const addressCollection = require('../model/address')
const order = require('../model/order');
const bcrypt = require('bcrypt');
const app = express();
const nocache = require("nocache");
const Wallet = require('../model/wallet')
app.use(nocache())
const session = require("express-session")
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));


const userProfile = async(req,res) => {
    if(req.session.userId){
      try{
        const user = req.session.userId
        const userdetails = await users.findOne({_id:user})
        res.render('userProfile',{userdetails})
      }catch(err){
        console.log(err)
    }
  }else{
    res.redirect('/Login')
  }
}

const editProfileget = async(req,res)=>{
  const user = req.session.userId 
  const userdetails = await users.findOne({_id:user})
  res.render('editProfile',{userdetails})
}

const editUserpost = async(req,res)=>{
  try{
    const id = req.params.id
    const user = req.session.userId 
    const userdetails = await users.findOne({_id:user})
    if((req.body.firstname===null || req.body.firstname.trim() === "" )||(req.body.lastname === null || req.body.lastname.trim() === "")){
      res.render('editProfile',{message:"Fill out the fields",userdetails})
    }else if(userdetails.firstname===req.body.firstname&&userdetails.lastname===req.body.lastname){
      res.redirect('/userProfile')
    }else{
    await users.findByIdAndUpdate(id,{
      firstname:req.body.firstname,
      lastname:req.body.lastname,
      email:req.body.email
    })
    res.redirect('/userProfile')
  }
  }catch(err){
    console.log(err)
  }

}

const changePasswordget = (req,res)=>{
  res.render('changePassword')
}

//to check password validation
function isPasswordValid(password) {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
  return passwordRegex.test(password);
}

const userchangePassword = async(req,res)=>{
  if(req.session.userId){
    try{
      if(!isPasswordValid(req.body.newPassword)){
        res.render("changePassword", { message: "Password must be at least 5 characters long and contain at least one uppercase letter, one lowercase letter, and one digit" });
      }
        const userId = req.session.userId
        const userData = await users.findOne({_id:userId})
        console.log(userData)
        const isValid = await bcrypt.compare(req.body.currentPassword, userData.password)
        console.log(isValid);
        if(isValid){
          const newPassword = req.body.newPassword
          const hash = await bcrypt.hash(newPassword, 10)
          console.log(hash);
          await users.findByIdAndUpdate({_id:userId},{
            password:hash
          })
          res.redirect('/userProfile')
        }else{
          res.render('changePassword',{message:"Current password is wrong"})
        }
    }catch(err){
      console.log(err)
    }
  }
}

const addAddressget = (req,res)=>{
  res.render('addAddress')
}

const submitAddress = async(req,res)=>{
  try{
    if((req.body.firstname===null || req.body.firstname.trim() === "")||(req.body.lastname===null || req.body.lastname.trim() === "")||(req.body.address===null || req.body.address.trim() === "")||(req.body.city===null || req.body.city.trim() === "")||(req.body.state===null || req.body.state.trim() === "")||(req.body.pincode===null || req.body.pincode.trim() === "")||(req.body.phone===null || req.body.phone.trim() === "")){
      res.render('addAddress',{message:"Fill out the fields"})
    }else if(req.session.userId){
      const value = {
        userid:req.session.userId,
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        address:req.body.address,
        city:req.body.city,
        state:req.body.state,
        pincode:req.body.pincode,
        phone:req.body.phone,
      }
      await addressCollection.insertMany([value])
      .then(x=>{
        res.redirect('/userProfile')
      })
    }else{
      console.log('Address field not entered')
    }
    }catch{
      console.log(err)
    }
  }

const getviewAddress = async(req,res)=>{
  const user = req.session.userId
  const data = await addressCollection.find({userid: user})
  res.render('viewaddress',{data})
}

const deleteadd = async(req,res)=>{
  try{
    const userId = req.params.id
    const result = await addressCollection.findByIdAndDelete({_id: userId})
    if(result){
      res.redirect('/viewAddress')
    }else{
      console.log("Address not found")
    }
  }catch(err){
    console.log(err)
  }
}

const updateaddget = async(req,res)=>{
  try{
    const userId = req.params.id
    const address = await addressCollection.findOne({_id: userId})
    res.render('editAddress',{address})
  }catch{
    console.log(err)
  }
}

const updateaddpost = async(req,res)=>{
  try{
    const addressId = req.params.id
    const userId = req.params.id
    const address = await addressCollection.findOne({_id: userId})
    if((req.body.firstname===null || req.body.firstname.trim() === "")||(req.body.lastname===null || req.body.lastname.trim() === "")||(req.body.address===null || req.body.address.trim() === "")||(req.body.city===null || req.body.city.trim() === "")||(req.body.state===null || req.body.state.trim() === "")||(req.body.pincode===null || req.body.pincode.trim() === "")||(req.body.phone===null || req.body.phone.trim() === "")){
      res.render('editAddress',{message:"Fill out the fields",address})
    }
    const oldaddress = await addressCollection.findByIdAndUpdate(addressId,{
      firstname : req.body.firstname,
      lastname : req.body.lastname,
      address : req.body.address,
      city : req.body.city,
      state : req.body.state,
      pincode : req.body.pincode,
      phone : req.body.phone,
    })
    .then(x=>{
      res.redirect('/viewAddress')
    })
  }catch(err){
    console.log(err)
  }
}

const walletHistory = async(req,res)=>{
if(req.session.userId){
  try{
    const user = req.session.userId
    const data = await Wallet.find({userid: user})
    const bal = await users.findOne({_id: user})
    console.log(data);
    res.render('wallet',{data,bal})
  }catch(err){
    console.log(err)
  }
  }else{
    res.redirect('/')
  }
}

module.exports ={
  userProfile,
  editProfileget,
  editUserpost,
  changePasswordget,
  userchangePassword,
  addAddressget,
  submitAddress,
  getviewAddress,
  deleteadd,
  updateaddget,
  updateaddpost,
  walletHistory
}