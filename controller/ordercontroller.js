const express = require('express');
const users = require('../model/users')
const Product = require('../model/products')
const cartCollection = require('../model/cart');
const addressCollection = require('../model/address');
const order = require('../model/order');
const Reason = require('../model/reason')
const Return = require('../model/return')
const Wallet = require('../model/wallet')
const PDFDocument = require('pdfkit')
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const mongoose = require('mongoose');

const nocache = require("nocache");
app.use(nocache())
app.use(express.static('public'));
const session = require("express-session");
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));
app.use(express.json());

function generateUniqueID() {
  // Generate a random four-digit number
  let id = Math.floor(100 + Math.random() * 900);
  // Prepend "ORD" to the id
  return "ORD" + id;
}

const showOrderget = async(req,res)=>{
    if(req.session.userId){
      const user = req.session.userId
      const data = await order.find({userid:user}).sort({ orderdate: -1 });
      res.render('showOrder',{data,generateUniqueID})
    }else{
      res.redirect('/')
    }
 
}

const viewMore = async(req,res)=>{
  const id = req.params.id;
  const productId = req.params.productid
  const img = req.params.proid
  const orders = await order.findById(id)
  const images = await Product.findById(img)
  const orderAddress = await addressCollection.findById(orders.address)
  console.log("Orders :",images);
  let selectedProduct;
  for(const product of orders.productcollection){
    if(product._id.toString() == productId){
      selectedProduct = product;
      break;
    }
  }
  console.log("Selected product :",selectedProduct);
  console.log("orders: ",orders)
  res.render('viewMore',{selectedProduct,orders,orderAddress,images})
}

const cancelorderget = async (req, res) => {
  try {
    const id = req.params.id;
    const userid = req.session.userId; // Ensure req.session.userId is correctly set
    const newStatus = "Cancelled";
    const userCart = await cartCollection.find({ userid: userid });

    const updateOrder = await order.findOneAndUpdate(
      { userid, 'productcollection._id': id },
      { $set: { 'productcollection.$.status': newStatus } },
      { new: true }
    ).then(x=>{
      console.log('updtaed',x);
      return res.status(200).json({ succes: 'Order cancelled' });
    }).catch(x=>{
      console.log('fail',x);
    })


    // console.log(updateOrder);
    if (!updateOrder) {
      // Order not found
      return res.status(404).json({ error: 'Order not found' });
    }

    // res.redirect(""); // Redirect to show updated order details
  } catch (error) {
    console.error("Error during order cancellation:", error);
    res.status(500).json({ error: 'Internal Server Error' }); // Return specific error message
  }
};


const adorderpost = async(req,res)=>{
  const newStatus = req.body.newStatus
  try{
    const orderId = req.params.id;
    const productId = req.params.productid
    console.log("productId",productId)
    console.log("orderId",orderId)

     // Fetch the order
    // const order = await order.findById(orderId);
    console.log('Order',order)
    await order.updateOne(
      {'_id': orderId, 'productcollection._id': productId},
      {$set: {'productcollection.$.status': newStatus}},
      {new: true})
    
    if (newStatus === 'Cancelled') {
      const cancelledOrder = await order.findById(orderId);
      const product = cancelledOrder.productcollection.id(productId);
      const user = await users.findById(cancelledOrder.userid);
      user.wallet += parseInt(product.price) * product.quantity; // Assuming the price is the refund amount
      await user.save();
    }
    
    const cancelledOrder = await order.findById(orderId);
    const product = cancelledOrder.productcollection.id(productId);
    const wallethistory = {
      userid: cancelledOrder.userid,
      date: new Date(),
      amount: parseInt(+product.price) * product.quantity,
      type: "Cancelled",
      creditordebit: "Credited"
    }
    await Wallet.insertMany([wallethistory])
    console.log("wallet updated",wallethistory)

    res.redirect('/adminOrder')
  }catch(err){
    console.log(err)
  }
}

const storeReason = async(req,res)=>{
  const orderid=req.params.id
  const id        = req.session.userId
  const reason  = req.body.reason;
  const productId = req.params.pid
  console.log("productid",productId)
  console.log("reason",reason)
  console.log("The id is",id)
    const newReason = new Reason({
    userid: id,
    productid: productId,
    reason: reason,
    orderid:orderid
  });

  newReason.save()
    .then(savedReason => {
      console.log('stored',savedReason);
      res.redirect('/showOrder')
      // res.status(200).json({ message: 'Cancellation reason stored successfully', savedReason });
    })
    .catch(err => {
      res.status(500).json({ error: 'Failed to store cancellation reason', err });
    });
}


const getInvoice = async(req,res)=>{
      try {
          const userid = req.session.userId;
          const orderid = req.params.id;
          console.log('orderid:  ',orderid)
          const productid = req.params.productid;
          console.log('productid:  ',productid)
          const userDetails = await users.findById(userid);
          const orders = await order.findById(orderid);
          const orderAddress = await addressCollection.findById(orders.address)
         
          let productdata;
      
          for (let product of orders.productcollection) {
              if (productid == product.productid) {
                  productdata = product;
                  break;
              }
          }
      
          const doc = new PDFDocument();
      
          // Set response headers to trigger a download
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
      
          // Pipe the PDF document to the response
          doc.pipe(res);
      
          const imagePath = "public/img/banner-3.jpg";
          const imageWidth = 100;
          const imageX = 550 - imageWidth;
          const imageY = 50;
      
          doc.image(imagePath, imageX, imageY, { width: imageWidth });
          doc.moveDown(1);
      
          // Add content to the PDF document
          doc.fontSize(16).text("Billing Details", { align: "center" });
          doc.moveDown(1);
          doc.fontSize(10).text("Order Details", { align: "center" });
          doc.text(`Order ID: ${orderid}`);
          doc.moveDown(0.3);
          doc.text(`Name: ${orders.firstname || ""}`);
          doc.moveDown(0.3);
          doc.text(`Email: ${userDetails.email || ""}`);
          doc.moveDown(0.3);
      
          doc.moveDown(0.3);
          doc.text(`Address: ${orderAddress.address || ""}`);
          doc.moveDown(0.3);
          doc.text(`Payment Method: ${orders.paymentmode|| ""}`);
      
          console.log("hghgd");
      
          doc.moveDown(0.3);
      
          const headerY = 300; // Adjust this value based on your layout
          doc.font("Helvetica-Bold");
          doc.text("Name", 100, headerY, { width: 150, lineGap: 6 });
          doc.text("Status", 300, headerY, { width: 150, lineGap: 5 });
          doc.text("Quantity", 400, headerY, { width: 150, lineGap: 5 });
          doc.text("Price", 500, headerY, { width: 50, lineGap: 5 });
          doc.font("Helvetica");
      
          // Table rows
          const contentStartY = headerY + 30; // Adjust this value based on your layout
          let currentY = contentStartY;
      
          doc.text(productdata.productname || "", 100, currentY, {
              width: 150,
              lineGap: 5,
          });
      
          doc.text(productdata.status || "", 300, currentY, {
              width: 50,
              lineGap: 5,
          });
      
          doc.text(productdata.quantity || "", 400, currentY, {
              width: 50,
              lineGap: 5,
          });
      
          doc.text(productdata.price || "", 500, currentY, {
              width: 50,
              lineGap: 5,
          });
      
          // Calculate the height of the current row and add some padding
          const lineHeight = Math.max(
              doc.heightOfString(productdata.productname || "", { width: 150 }),
              doc.heightOfString(productdata.status || "", { width: 150 }),
              doc.heightOfString(productdata.price || "", { width: 50 })
          );
      
          currentY += lineHeight + 10; // Adjust this value based on your layout
      
          doc.text(`Total Price: ${productdata.price * productdata.quantity || ""}`, {
              width: 400, // Adjust the width based on your layout
              lineGap: 5,
          });
      
          // Set the y-coordinate for the "Thank you" section
          const separation = 50; // Adjust this value based on your layout
          const thankYouStartY = currentY + separation; // Update this line
      
          // Move to the next section
          doc.y = thankYouStartY; // Change this line
      
          // Move the text content in the x-axis
          const textX = 60; // Adjust this value based on your layout
          const textWidth = 500; // Adjust this value based on your layout
      
          doc
              .fontSize(16)
              .text(
                  "Thank you for choosing Speculo! We appreciate your support and are excited to have you as part of our family.",
                  textX,
                  doc.y,
                  { align: "left", width: textWidth, lineGap: 10 }
              );
      
          doc.end();
      
      } catch (err) {
          console.error(err);
          return res.status(500).send("Failed to fetch orders. Please try again.");
      }
  }

const returnorder = async(req,res)=>{
  try{
    const id = req.params.orderId
    const productId = req.body.productId;
    let reason = req.body.reason
    console.log("reason",reason)
    const userid = req.session.userId
    const orders = await order.findById(id)
    console.log("id",id);
    const newStatus ="Returned"
    const updatedOrder = await order.findOneAndUpdate(
      {userid,'productcollection._id':id},
      {$set:{'productcollection.$.status': newStatus}},
      {new: true}
    );
    console.log("updatedOrder",updatedOrder);

    const product = updatedOrder.productcollection[0];

    const data = {
      userid: req.session.userId,
      product: product.productname,
      amount: product.price * product.quantity,
      reason: reason,
      productid: productId,
      orderid: id
    }
    await Return.insertMany([data])

    const user = await users.findById(req.session.userId)
    user.wallet += data.amount
    await user.save()

    const wallethistory = {
      userid: req.session.userId,
      date: new Date(),
      amount: +product.price * product.quantity,
      type: "Return",
      creditordebit: "Credited"
    }
    await Wallet.insertMany([wallethistory])
    console.log("updated user",user);

    res.redirect('/showOrder')
  }catch(err){
    console.log(err)
  }
} 

const walletpay = async(req,res)=>{
  try {
    const userId = req.session.userId;
    const user = await users.findById(userId);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Access the selected address, payment mode, and total overall price from req.body
    const selectedAddress = req.body.selectedAddress;
    const paymentMode = req.body.paymentMode;
    const totalOverallPrice = req.body.totalOverallPrice;

    const usercart = await cartCollection.find({ userid: userId });
    const today = new Date();
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const todaydate = today.toLocaleString('en-US', options);
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 4);
    const deliveryDateString = deliveryDate.toLocaleString('en-US', options);

    let walletAmount = user.wallet;
    console.log('wallet amount before', walletAmount);
    let productData
    const productCollectionArray = [];
    for (const item of usercart) {
         productData = {
            productid: item.productid,
            productname: item.product,
            price: item.price,
            quantity: item.quantity,
            status: "pending"
        };

        productCollectionArray.push(productData);

        // Update product stock
        await Product.updateOne(
            { _id: item.productid },
            { $inc: { Stock: -item.quantity } }
        );
    }

    const orderData = {
        userid: req.session.userId,
        firstname: usercart[0].user, // Assuming username is the same for all cart items
        productcollection: productCollectionArray,
        orderdate: todaydate,
        deliverydate: deliveryDateString,
        address: selectedAddress,
        paymentmode: paymentMode,
        // Assuming discount is sent in the request body

    };
    console.log('values are on ordering', orderData);
    // Create a single order document with an array of cart items
    await order.create(orderData);

    // Delete user's cart
    await cartCollection.deleteMany({ userid: req.session.userId });
    // Update the user's wallet amount
    let totalPrice = 0;
    for (const item of usercart) {
        totalPrice += item.price * item.quantity;
    }
    walletAmount -= totalPrice;
    user.wallet = walletAmount;
    await user.save();
    
    console.log('wallet amount after', walletAmount);
    await cartCollection.deleteMany({ userid: userId });

    // For wallet history
    const wallethistory = {
      userid: req.session.userId,
      date: new Date(),
      amount: -totalPrice,
      type: "Purchase",
      creditordebit: "Debited"
    }
    await Wallet.insertMany([wallethistory])

    res.redirect('/confirmOrder');

} catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
}
};

// Gerate Id Functions Starts
function generateUniqueID() {
  // Generate a random four-digit number
  let id = Math.floor(100 + Math.random() * 900);
  // Prepend "ORD" to the id
  return "ORD" + id;
}

function generateUniqueTransactionID() {
  // Generate a random four-digit number
  let id = Math.floor(100 + Math.random() * 900);
  // Prepend "PRD" and order ID to the id
  return "TRNS" + id ;
}

const confirmOrder = async(req,res)=>{
  const id = req.session.userId
  const userCart = await order.findOne({userid:id}).sort()
  console.log("confirm order:",userCart)
  res.render('confirmOrder',{userCart,generateUniqueID,generateUniqueTransactionID});
}

module.exports = {
  showOrderget,
  viewMore,
  cancelorderget,
  adorderpost,
  storeReason,
  getInvoice,
  returnorder,
  walletpay,
  confirmOrder
}