const express = require('express');
const { collection } = require('../model/users');
const users = require('../model/users');
const adrouter = express.Router();
const Category = require('../model/category')
const Product = require('../model/products')
const path = require('path')
const order = require('../model/order');
const reason = require('../model/reason')
const addressCollection = require('../model/address')
const Return = require('../model/return')
const ExcelJS = require('exceljs')
const PDFDocument  = require('pdfkit-table')
const app = express();
const nocache = require("nocache");
const { returnorder } = require('./ordercontroller');
app.use(nocache())


const admin = (req,res)=>{
  if(req.session.addata){
    res.redirect('/adminhome')
  }else{
    res.render('adminlogin',{title:"AdminLogin"})
  }
}


const credential ={
  email:"admin@gmail.com",
  password:"admin",
  isAdmin:"true"
}

const data = async(req,res)=>{
  if(req.session.addata){
    const datas = await users.find()
    res.render('adminHome',{datas})
  }else{
    res.redirect('/admin')
  } 
}

//Login for admin
const adminLogin = (req,res)=>{
  if(req.body.email===credential.email&&req.body.password===credential.password&&credential.isAdmin==="true"){
    req.session.addata=req.body
    res.redirect('/adminhome')
  }else(
    res.render('adminLogin',{title:"Express",message:"Invalid Admin"})
  )
}

//admin Dashboard
const adminDash = (req,res)=>{
  if(req.session.addata){
    res.redirect('/adminhome')
  }else{
    res.redirect('/adminLogin')
  }
}

//route for logout
const adminLogout = (req,res)=>{
  req.session.destroy(function(err){
    if(err){
      console.log(err)
      res.send("Error")
    }else{
      res.render('adminLogin',{title:"adminHome",message:"Logout successfull"})
    }
  })
}

//block user

const blockUser = async(req,res)=>{
  const val = await users.findOne({_id:req.params.id})
  val.isBlocked = !val.isBlocked
  val.save()
  res.redirect('/adminHome')
}

const dashUsers = (req,res)=>{
  res.redirect('/adminHome')
}

//delimg
const deleteimg = async (req, res) => {
  console.log('enterr');
  const productId = req.body.productId;
  const imageIndex = req.body.imageIndex;

  try {
    console.log("HOY");
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    if (imageIndex < 0 || imageIndex >= product.Image.length) {
      return res.status(400).send('Invalid image index');
    }

    product.Image.splice(imageIndex, 1);

    await product.save();

    res.status(200).send('Image removed successfully');
  } catch (err) {

    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

// Gerate Id Functions Starts
function generateUniqueID() {
  // Generate a random four-digit number
  let id = Math.floor(100 + Math.random() * 900);
  // Prepend "ORD" to the id
  return "ORD" + id;
}

const adminOrderget = async (req, res) => {
  if (req.session.addata) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 7; // Set the number of products per page
      const skip = (page - 1) * limit;
  
      const totalProducts = await order.countDocuments();
      const totalPages = Math.ceil(totalProducts / limit);
      const currentPage = page > totalPages ? totalPages : page;
      const data = await order.find().sort({ orderdate: -1 })
        .skip(skip)
        .limit(limit);
 
     
      const productIds = data.flatMap(order => order.productcollection.map(product => product.productid));
      console.log("productIds",productIds)
      const Reasons = await Return.find({ productid: { $in: productIds } });
      console.log('reasom',Reasons)
      res.render('adminOrders', { data, Reasons,generateUniqueID ,totalPages, currentPage,limit});
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.redirect('/admin');
  }
 };
 


  const salesReportget = async (req, res) => {
    if (req.session.addata) {
      try {
        // Daily sales report aggregation
        const dailyOrders = await order.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderdate" } }, // Group by date
              totalSales: { $sum: 1 } // Calculate total sales for each day
            }
          },
          { $sort: { _id: 1 } } // Sort by date
        ]);
  
        const { dates, orderCounts, totalOrderCount } = dailyOrders.reduce(
          (result, order) => {
            result.dates.push(order._id);
            result.orderCounts.push(order.totalSales); // Fix: Changed 'orderCount' to 'totalSales'
            result.totalOrderCount += order.totalSales;
            return result;
          },
          { dates: [], orderCounts: [], totalOrderCount: 0 }
        );
  
        console.log('count daily', dates, "", totalOrderCount,orderCounts); // Corrected variable name
         
        // For monthly orders
        const weeklyOrders = await order.aggregate([
          {
            $group: {
              _id: {
                year: { $year: "$orderdate" },
                week: { $week: "$orderdate" }
              },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1,"_id.week":1 } },
        ]);
        
        // Extract only the order counts
        const orderCount = weeklyOrders.map(order => order.orderCount);
        console.log("count ", orderCount);
        // Now the 'orderCounts' array contains only the order counts for each month
        const weeklyData = weeklyOrders.reduce((result, order) => {
          const weekYearString = `${order._id.year}-Week${order._id.week}`;
          result.push({
            week: weekYearString,
            orderCount: order.orderCount,
          });
          return result;
        }, [])
        console.log("weekly :",weeklyData);
        let monthdata=orderCount
        // console.log(totalOrderCount);
        const yearlyOrders = await order.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y", date: "$orderdate" } },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);
        
        const { years, orderCounts3, totalOrderCount3 } = yearlyOrders.reduce(
          (result, order) => {
            result.years.push(order._id);
            result.orderCounts3.push(order.orderCount);
            result.totalOrderCount3 += order.orderCount;
            return result;
          },
          { years: [], orderCounts3: [], totalOrderCount3: 0 }
        );
        
        
        // console.log("orders",totalOrderCount3,);
     console.log("monthky data");
    res.render('salesCharts', { dailyOrders,dates, orderCounts, monthdata, totalOrderCount3 });
    
      } catch (error) {
        console.error('Error fetching and aggregating orders:', error);
        res.status(500).send('Internal Server Error');
      }
    };
  }

  const salesReport = async (req, res) => {
    try {
      const startdate = new Date(req.query.startingdate);
      const Endingdate = new Date(req.query.endingdate);
      Endingdate.setDate(Endingdate.getDate() + 1);
      const orderCursor = await order.aggregate([
        {
          $match: {
            orderdate: { $gte: startdate, $lte: Endingdate }
          }
        }
      ]);
      console.log('order',orderCursor);
      if (orderCursor.length === 0) {
        return res.redirect('/salesReport');
      }
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
  
      // Add data to the worksheet
      worksheet.columns = [
        { header: 'Username', key: 'firstname', width: 15 },
        { header: 'Product Name', key: 'productname', width: 20 },
        { header: 'Quantity', key: 'quantity', width: 15 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Order Date', key: 'orderdate', width: 18 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'City', key: 'city', width: 20 },      // Add City column
        { header: 'Pincode', key: 'pincode', width: 15 }, // Add Pincode column
        { header: 'Phone', key: 'phone', width: 15 }      // Add Phone column
      ];
  
      for (const orderItem of orderCursor) {
        console.log('order iems',orderItem);
      for (const product  of orderItem.productcollection) {
        console.log('order product',product);
        // Fetch address details based on the address ID
        const addressDetails = await addressCollection.findById(orderItem.address);
          console.log('add',addressDetails);
        worksheet.addRow({
          'firstname': orderItem.firstname,
          'productname': product.productname,
          'quantity': product.quantity,
          'price': product.price,
          'status': product.status,
          'orderdate': orderItem.orderdate,
          'address': addressDetails ? addressDetails.address : 'N/A',
          'city': addressDetails ? addressDetails.city : 'N/A',
          'pincode': addressDetails ? addressDetails.pincode : 'N/A',
          'phone': addressDetails ? addressDetails.phone : 'N/A'
        });
      }
    }
  
      // Generate the Excel file and send it as a response
      workbook.xlsx.writeBuffer().then((buffer) => {
        const excelBuffer = Buffer.from(buffer);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=excel.xlsx');
        res.send(excelBuffer);
      });
    } catch (error) {
      console.error('Error creating or sending Excel file:', error);
      res.status(500).send('Internal Server Error');
    }
  }; 
  
  
  const pdfreport = async (req, res) => {
    try {
      const startingDate = new Date(req.query.startingdate);
      const endingDate = new Date(req.query.endingdate);
  
      // Fetch orders within the specified date range
      const orders = await order.find({
        orderdate: { $gte: startingDate, $lte: endingDate },
      });
      let addressDetails
      for(let address of orders){
          addressDetails = await addressCollection.findById(address.address);
        ;
      }
      console.log('Addressdetails',addressDetails)
      // Create a PDF document
      const doc = new PDFDocument();
      const filename = "sales_report.pdf";
  
      res.setHeader("Content-Disposition",` attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/pdf");
  
      doc.pipe(res);
  
      // Add content to the PDF document
      doc.text("Sales Report", { align: "center", fontSize: 10, margin: 2 });
  
      // Define the table data
      const tableData = {
        headers: [
          "Username",
          "Product Name",
          "Price",
          "Quantity",
          "Address",
          "City",
          "Pincode",
          "Phone",
        ],
        rows: orders.map((order) => [
          order.firstname,
          order.productcollection.map((product) => product.productname).join(", "),
          order.productcollection.map((product) => product.price).join(", "),
          order.productcollection.map((product) => product.quantity).join(", "),
          addressDetails.address,
          addressDetails.city,
          addressDetails.pincode,
          addressDetails.phone,
        ]),
      };
  
      // Draw the table
      await doc.table(tableData, {
        prepareHeader: () => doc.font("Helvetica-Bold"),
        prepareRow: () => doc.font("Helvetica"),
      });
  
      // Finalize the PDF document
      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  const adviewMore = async(req,res)=>{
    const userId = req.params.userid;
    const productId = req.params.productid
    console.log("pd",productId)
    const reason = await Return.findOne({ orderid:productId })
    const address = await addressCollection.findOne({ userid:userId }) 
    console.log('reaons:',reason)
    console.log('address:',address)
    res.render('adminOrderMore',{address,reason})
  }

module.exports = {
  admin,
  data,
  adminLogin,
  adminDash,
  adminLogout,
  blockUser,
  dashUsers,
  deleteimg,
  adminOrderget,
  salesReportget,
  salesReport,
  pdfreport,
  adviewMore
}