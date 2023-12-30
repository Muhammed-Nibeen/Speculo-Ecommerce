const express = require('express');
const router = express.Router();
const app = express()
const users = require('../model/users')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const {v4:uuidv4} = require("uuid");
const { data } = require('./admincontroller');
const Product = require('../model/products')
const Category = require('../model/category')
const Offer = require('../model/offer')
// const session=require('express-session')
const bcrypt = require('bcrypt');
const nocache = require("nocache")
app.use(nocache())


app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))


const home = (req,res)=>{
 res.redirect('/Login')
}

let referedcode = ""
let referedlink = ""

const login = (req,res)=>{
  if (!req.session) {
    req.session = {}; // Initialize req.session if it doesn't exist
  }
  const userin =req.session.data
  if(userin){
    res.redirect('/UserHome')
  }else{
    res.render('userLogin',{title:"UserLogin"})
  }
 
}

const reregis = (req,res)=>{
  res.render('userSignup',{title:"express"})
}


//form validation for email
function isEmailValid(email) {
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

//to check password validation
function isPasswordValid(password) {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
  return passwordRegex.test(password);
}

function generateReferralCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const codeLength = length || 8; // You can adjust the length of the referral code

  let referralCode = '';
  for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      referralCode += characters.charAt(randomIndex);
  }
  return referralCode;
}

function generateReferralLink(baseUrl) {
  return `${baseUrl}/ref/${generateReferralCode(8)}`;
}

const register = async(req,res)=>{
  req.session.data=req.body
  if(req.body.referalcode != "" || req.body.referallink != ""){
    referedcode = req.body.referalcode
    referedlink = req.body.referallink
  }
  if(!isEmailValid(req.body.email)){
    res.render('userSignup',{title:"Userlogin",message:"Email not valid"})
  }
  if(!isPasswordValid(req.body.password)){
    res.render("userSignup", {title:"Userlogin", message: "Password must be at least 5 characters long and contain at least one uppercase letter, one lowercase letter, and one digit" });
  }
  if((req.body.email===null || req.body.email.trim() === "" )||(req.body.password === null || req.body.password.trim() === "")||(req.body.firstname === null || req.body.firstname.trim() === "")){
    res.render('userSignup',{title:"Express",message:"Fill the username and password"});
  }
  const data = await users.findOne({ email:req.body.email });
    
    if (!data){
      //OTP generator
      const generateOTP = (length)=>{
        const digits = '0123456789';
        let OTP = "";
        
        for(let i=0;i<length;i++){
          const randomIndex = crypto.randomInt(0, digits.length)
          OTP += digits[randomIndex];
        }
        return OTP;
      }
      
      const sendOtpEmail = async (email, otp) =>{
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth:{
            user: "nibiniz339@gmail.com",
            pass:"vfgtouqbqemqffpk"
          }
        });
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "One-Time Password(OTP) for Authentication for Spectro",
          text:`Your Authentication Otp is: ${otp}`
        };
        transporter.sendMail(mailOptions,async(error, info)=>{
          if(error){
            return console.error("Error:",error)
          }
          console.log("Email sent:",info.response)
        })
      }
      
      const otp = generateOTP(6);
      req.session.otp = otp;
      await sendOtpEmail(req.body.email, otp);
      res.render('otp',{title:"Otp verification"})
    }else{
      res.render("userSignup",{title:"userSignUp",message:"Email already exist"})
    }
  } 


const reotp = (req,res)=>{
  res.render('otp',{title:"Otp"})
}

const otpVerify = async(req,res)=>{
  const enteredOtp = req.body.otp;
  const otp = req.session.otp;

  let iseligible = false

  if(enteredOtp === otp){
    const randomReferralCode = generateReferralCode(8); // Generating an 8-character referral code
    console.log('Generated Referral Code:', randomReferralCode);
    req.session.referalcode = randomReferralCode
    const randomReferralLink = generateReferralLink('http://localhost:1000')
    console.log('Generated random link',randomReferralLink)
    req.session.referallink = randomReferralLink
    const userData = req.session.data;
    if(referedcode != "" || referedlink != ""){
    const isReferalValid = await users.findOne({referalcode:referedcode}) 
    const isReferalLiValid = await users.findOne({referallink:referedlink})
      if(isReferalValid != null || isReferalLiValid != null){
        console.log('referral valid')
        iseligible = true
        await users.updateOne({referalcode: referedcode},{$inc:{wallet:100}})
        await users.updateOne({referallink: referedlink},{$inc:{wallet:100}})
      }else{
        console.log('referal invalid')
      }
    } 
    console.log(userData)
    const password = userData.password;
    console.log("password before hashing:", password);
    const hash = await bcrypt.hash(password, 10)
    const newUser = new users({
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.email,
      password: hash,
      isBlocked: false,
      referalcode: req.session.referalcode,
      wallet: iseligible ? 50 : 0,
      referallink: req.session.referallink
    });
    console.log("hashed password is:",hash)
    //User data insertion
    await users.insertMany([newUser]);
    // res.redirect('/userHome')
    res.render("userLogin",{title:"userLogin",message:"user created"})
  }else{
    res.render('otp',{title:"userLogin",message:"incorrect otp"})
  }
}

const userHome = async(req,res)=>{
      const datas = await Product.find()
      const userid = req.session.userid
      res.render('userHome',{title:"userHome",datas,userid})
  }

const userLogin = async (req, res) => { 
  try {
    const check = await users.findOne({ email: req.body.email });
    const isValid = await bcrypt.compare(req.body.password, check.password)
    console.log(isValid)
      if (isValid && check.email === req.body.email) {
        req.session.data = req.body;
      if (!req.session) {
        req.session = {}; // Initialize req.session if it doesn't exist
      }
        if(!check.isBlocked){
      req.session.userId = check._id
      res.redirect('/UserHome')
        }else{
          res.render('userLogin',{title:"SigniN",message:"Blocked User"})
        }
    }else{
      res.render('userLogin', { title: "Express", message: "Wrong details" });
    }   
  } catch (err) {
    console.log(err);
    res.render('userLogin', { title: "Express", message: "No user" });
  }
};

const userSession = async(req,res)=>{
  let userin = req.session.data
  console.log(userin);
  if(userin){
    res.render('userHome')
  }else{
    res.redirect('/Login')
  }
}


const userLogout = (req,res)=>{
  req.session.destroy(function(err){
    if(err){
      console.log(err);
      res.send("Error")
    }else{
      res.render('userLogin',{title:"UserLogin",message:"Logout Succesfull"})
    }
  })
}


const viewfulldetails = async (req, res) => {
  try {
    const id = req.params.id;
    let data = await Product.findById(id)
    const categorydata = await Category.findOne({_id:data.Category})

    const offer = await Offer.findOne({$or:[{applicableProduct:data.Productname},{applicableCategory:categorydata.category}]})

    
    res.render('details', {data,offer,userId:req.session.userId} ); 
  } catch (error) {
    console.log(error);
  }
};

const showshops = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 3; // Set the number of products per page
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments({ isListed: true });
    const totalPages = Math.ceil(totalProducts / limit);
    const currentPage = Math.min(page, totalPages);

    // Issue might be here - You should use skip and limit in your query
    const datas = await Product.find({ isListed: true })
      .skip(skip)
      .limit(limit);
    console.log('currentPage',currentPage)
    console.log('totalPages',totalPages);
    console.log('datas',datas);
    res.render('shop', { datas, totalPages, currentPage });
  } catch (error) {
    console.log(error);
  }
};


//User forgot password
const forgotPassword = (req,res)=>{
  res.render('forgotPassword',{title:"UserLogin"})
}

//OTP verification for forgot password
const otpForgotPassword = async(req,res)=>{
  const user = await users.findOne({ email:req.body.email  });
  if(!user){
    res.render('forgotPassword',{title:"express",message:"Email do not exist"})
  }else{
    req.session.email = req.body.email
    //OTP generator
    const generateOTP = (length)=>{
      const digits = '0123456789';
      let OTP = "";
      
      for(let i=0;i<length;i++){
        const randomIndex = crypto.randomInt(0, digits.length)
        OTP += digits[randomIndex];
      }
      return OTP;
    }
    
    const sendOtpEmail = async (email, otp) =>{
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth:{
          user: "nibiniz339@gmail.com",
          pass:"vfgtouqbqemqffpk"
        }
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "One-Time Password(OTP) for Forgot Password for Speculo",
        text:`Your Authentication Otp is: ${otp}`
      };
      transporter.sendMail(mailOptions,async(error, info)=>{
        if(error){
          return console.error("Error:",error)
        }
        console.log("Email sent:",info.response)
      })
    }
    
    const otp = generateOTP(6);
    req.session.otp = otp;
    await sendOtpEmail(req.body.email, otp);
    //Enter OTP
    res.render('otpForgotPassword',{title:"ForgotPassword",message:"Enter the otp"});
  }
}

const otpVerifyPassword = async(req,res)=>{
  const enteredOtp = req.body.otp;
  const otp = req.session.otp;
  if(enteredOtp === otp){
    res.render('reEnterPassword',{title:"ReEnter Password ",message:"Enter new password"})
  }
}


const newPassword = async(req,res) => {
  if(req.body.password === req.body.confirmPassword){
    const password = req.body.password
    const hash = await bcrypt.hash(password, 10)
    await users.updateOne(
      { email :req.session.email},
      { $set: {password:hash}}
    )
    res.redirect('/')
  }else{
    res.render('reEnterPassword',{title:"ReEnter Password",message:"Not same password enter new one"})
  }
}
 
const filterCat = async(req,res)=>{
  const { filterBy, sortBy, searchQuery } = req.query;
  console.log("req.query",req.query)
  console.log('filterBy',filterBy)
  console.log('sortBy',sortBy);
  console.log('query',searchQuery)
  try {
    let filteredProducts;
    let sortOrder;
 
    const products = await Product.find({ Productname: { $regex: new RegExp(searchQuery, 'i') } }).populate('Category');;
 
    switch (filterBy) {
      case 'gucci':
        filteredProducts = products.filter((product) => {
          return product.Category.category === 'Gucci';
        });
        break;
      case 'rayban':
        filteredProducts = products.filter((product) => {
          return product.Category.category === 'Rayban';
        });
        break;
      case 'versace':
        filteredProducts = products.filter((product) => {
          return product.Category.category === 'Versace';
        });
        break;
      default:
        filteredProducts = products; // If no filterBy value matches, return all products
        break;
    }
    switch (sortBy) {
      case 'low-high':
        sortOrder = 1;
        break;
      case 'high-low':
        sortOrder = -1;
        break;
      default:
        sortOrder = 1; // Default sorting order
        break;
    }
 
    filteredProducts.sort((a, b) => (a.Price - b.Price) * sortOrder);
 
    console.log('sortedProducts: ', sortOrder);
    res.json(filteredProducts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
 };
 

 
  
// const searchGet = async(req,res)=>{
//   const { query } = req.query;

//   try {
//     // Using a regular expression to perform a case-insensitive search on Productname
//     const searchedProducts = await Product.find({ Productname: { $regex: new RegExp(query, 'i') } });
//     res.json(searchedProducts);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const viewdetails = async(req,res)=>{
  try {
    const id = req.params.id;
    let data = await Product.findById(id)
    const categorydata = await Category.findOne({_id:data.Category})

    const offer = await Offer.findOne({$or:[{applicableProduct:data.Productname},{applicableCategory:categorydata.category}]})
    res.render('details', {data,offer,userId:req.session.userId} );
  } catch (error) {
    console.log(error);
  }
}

const viewdetail = async(req,res)=>{
  try {
    const id = req.params.id;
    console.log(id)
    let data = await Product.findById(id)
    const categorydata = await Category.findOne({_id:data.Category})

    const offer = await Offer.findOne({$or:[{applicableProduct:data.Productname},{applicableCategory:categorydata.category}]})
    res.render('details', {data,offer,userId:req.session.userId} );
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  home,
  userHome,
  login,
  reregis,
  register,
  userLogin,
  userSession,
  userLogout,
  reotp,
  otpVerify,
  viewfulldetails,
  showshops,
  forgotPassword,
  otpForgotPassword,
  otpVerifyPassword,
  newPassword,
  filterCat,
  // searchGet,
  viewdetails,
  viewdetail
}