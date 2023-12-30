const express = require('express');
const app = express();
const users = require('../model/users')
const Product = require('../model/products')
const Category = require('../model/category')
const Offer = require('../model/offer')
const cartCollection = require('../model/cart');
const addressCollection = require('../model/address');
const order = require('../model/order');
require('dotenv').config();
const Razorpay=require('razorpay')
const nocache = require("nocache");
const Coupon = require('../model/coupon')
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(nocache());

const getcart = async(req,res)=>{
  try{
  const cart = await cartCollection.find({userid:req.session.userId})
  const offersForProducts = []

  for(const cartItem of cart){
    const product = await Product.findById(cartItem.productid)
    const categorydata = await Category.findById(product.Category)

    const offer = await Offer.findOne({$or:[{applicableProduct:product.Productname},{applicableCategory:categorydata.category}]})

    offersForProducts.push({
      cartItem: cartItem,
      offer: offer ? offer: null,
    })
  }
    console.log("Ofefrr s  sjffjsd",offersForProducts);

    if(cart.length > 0){
      res.render("cart",{offers:offersForProducts,cart,userId:req.session.userId})
    }else{
      res.render("cart",{cart: [] })
    }
  }
  catch(err){
    console.log(err)
  }
}

const getAddCart = async(req,res) =>{
  try{
    const userId = req.session.userId
    const productId = req.params.id
    console.log(userId)
    const cart = await cartCollection.findOne({userid: userId, productid: productId})
    if(cart != null){
      cart.quantity++;
      cart.save();
      const productData = await Product.findOne({_id: productId})
      res.redirect('/cart')
    }else{
      const userData = await users.findOne({ _id: userId })
      const productData = await Product.findOne({ _id: productId })
      const newCart = new cartCollection({
        userid : userData._id,
        user: userData.firstname,
        
        productid: productData._id,
        product: productData.Productname,
        price : productData.Price,
        quantity : 1,
        image : productData.Image[0]
      })
      await newCart.save()
      res.redirect('/cart')
    }
  }catch(err){
    console.log(err)
  }
}

const getRemoveCart = async(req,res) =>{
  try{
  const productId = req.params.id
  const cart = await cartCollection.findByIdAndDelete(productId)
  res.redirect('/cart')
  }catch(err){
    console.log(err)
  }
  
}

const getAddQuantity = async(req,res) =>{
  try{
    const productId = req.params.id;
    const cart = await cartCollection.findOne({_id:productId})
    const product = await Product.findById(cart.productid)
    if(product.Stock > cart.quantity){
      cart.quantity++
      cart.save()
      res.json({ updatedQuantity: cart.quantity})
    }else{
      res.json({message:"Maximimum stock reached"})
    }
  }catch(err){
    console.log(err)
  }
}

const getSubQuantity = async(req,res)=>{
  try{
    const productId = req.params.id
    const cart = await cartCollection.findOne({_id:productId})
    if(cart.quantity > 1){
      cart.quantity--;
      cart.save()
      res.json({updatedQuantity: cart.quantity})
    }else{
      console.log("hello")
      res.redirect('/cart')
    }
  }catch(err){
    console.log(err)
  }
}

const getcheckout = async(req,res)=>{
  const id = req.session.userId
  const userCart = await cartCollection.find({userid:req.session.userId})
  const coupondata = await Coupon.find()
  const user = await users.findById(id)
  const walletAmount = user ? user.wallet : 0;
  const offersForProducts = []

  for(const cartItem of userCart){
    const product = await Product.findById(cartItem.productid)
    const categorydata = await Category.findById(product.Category)

    const offer = await Offer.findOne({$or:[{applicableProduct:product.Productname},{applicableCategory:categorydata.category}]})

    offersForProducts.push({
      cartItem: cartItem,
      offer: offer ? offer : null,
    })
  }

  if(userCart.length>0){

    let totalPriceAfterOffers = 0;

    for(const cartItem of userCart){
      const matchingOffer = offersForProducts.find(offerItem=>offerItem.cartItem.product === cartItem.product && offerItem.offer !== null)
      const itemPrice = matchingOffer ? cartItem.price - (cartItem.price * matchingOffer.offer.discount/100) : cartItem.price
      totalPriceAfterOffers += cartItem.quantity * itemPrice
    }

    const useraddress = await addressCollection.find({userid:id})
    const totalQuantity = userCart.reduce((total,item)=>total+item.quantity,0);
    res.render('checkout',{title:"checkout",userCart,offers:offersForProducts,useraddress,totalQuantity,totalPrice: totalPriceAfterOffers,coupondata,walletAmount})
  }
}

const postCheckedout = async(req,res)=>{
  const userId = req.session.userId
  const userCart = await cartCollection.find({userid:userId})
  console.log("usercart:",userCart)
  const currentDate = new Date();
  // creating an empty array for inserting the products odered by user 
  const productCollectionArray = [];
  for (const item of userCart) {
    const productData = {
        productid: item.productid,
        productname: item.product,
        price: item.price,
        quantity: item.quantity,
        status: "pending"
    };
    console.log(productData)
    
      // pushing the the products as objects in array
    productCollectionArray.push(productData);
    console.log("This is the array:",productCollectionArray)
      // Update product stock
    await Product.updateOne(
    { _id: item.productid },
    { $inc: { Stock: -item.quantity } }
     );
    }
    // console.log('values',req.body);
    // for(const item of userCart){
    const newOrder = {
      userid:  req.session.userId,
      firstname: userCart[0].user,
      productcollection: productCollectionArray,
      address: req.body.selectedAddress,
      orderdate: currentDate,
      paymentmode: req.body.paymentMethod,
    }
    await order.create(newOrder)
  
  await cartCollection.deleteMany({userid: req.session.userId})
  res.redirect('confirmOrder')
}




const razorpost = async (req, res) => {
  try {
      // Assuming you're using the Razorpay SDK or library
      var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET });
      console.log("amount is",req.body.amount)
      var options = {
          amount: req.body.amount  , // Get the amount from the request body
          
          currency: "INR",
          receipt: "order_rcptid_11",
      };
        
      // Creating the order
      instance.orders.create(options, function (err, order) {
          if (err) {
              console.error(err);
              res.status(500).send("Error creating order");
              return;
          }

          console.log(order);
          // Add order price to the response object
          res.send({ orderId: order.id });
      });
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
};


module.exports ={ 
  getcart,
  getAddCart,
  getRemoveCart,
  getAddQuantity,
  getSubQuantity,
  getcheckout,
  postCheckedout,
  razorpost,
}