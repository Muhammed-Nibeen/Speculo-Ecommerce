const express = require('express');
const { collection } = require('../model/users');
const users = require('../model/users');
const router = express.Router();
const Category = require('../model/category')
const Product = require('../model/products')
const path = require('path')


const addProduct = async(req,res)=>{
  if(req.session.addata){
    try{
      const categorylist = await Category.find()
      res.render('addProduct',{Categories:categorylist})
    }catch(error){
      console.log(error);
    }
  }else{
    res.redirect('/admin')
  }
}

const adpostProduct = async(req,res)=>{
  const Categories = await Category.find()
  if((req.body.productname===null || req.body.productname.trim() === "")||(req.body.category===null || req.body.category.trim() === "")||(req.body.price===null || req.body.price.trim() === "")||(req.body.stock===null || req.body.stock.trim() === "")||(req.body.model===null || req.body.model.trim() === "")||(req.body.description===null || req.body.description.trim() === "")){
  res.render('addProduct',{message:"Fields must be filled",Categories})
  }else if(req.session.addata){
    const prodata = {
      Productname:req.body.productname,
      Category:req.body.category,
      Price:req.body.price,
      Stock:req.body.stock,
      Model:req.body.model,
      Description:req.body.description,
      Image:req.files.map(file => file.path.substring(6))
    }
    console.log(prodata)
    await Product.insertMany([prodata])
    .then(x=>{
      console.log('inserted')
    })
    res.redirect('/viewProduct')
  }else{
    res.redirect('/admin',302)
  }
}

const viewproductlist = async(req,res)=>{
  if(req.session.addata){
    try{
      const prlist =await Product.find({}).populate('Category')
      res.render('adviewProduct',{prlist})
    }catch(error){
      console.log(error);
    }
  }else{
    res.redirect('/admin')
  }
}

const updatepro = async(req,res)=>{
  if(req.session.addata){
    try{
      const id = req.params.id
      const values =await Product.findById(id).populate('Category')
      const category = await Category.find()
      res.render('adUpProduct',{values,category})
    }catch(error){
      console.log(error)
    }
  }else{
    res.redirect('adminHome')
  }
}

const updatepropost = async(req,res)=>{
  const id = req.params.id
  const values =await Product.findById(id).populate('Category')
  const category = await Category.find()
  if((req.body.productname===null || req.body.productname.trim() === "")||(req.body.category===null || req.body.category.trim() === "")||(req.body.price===null || req.body.price.trim() === "")||(req.body.stock===null || req.body.stock.trim() === "")||(req.body.model===null || req.body.model.trim() === "")||(req.body.description===null || req.body.description.trim() === "")){
    res.render('adUpProduct',{message:"fill out the fields",values,category},)
  }else if(req.session.addata){
    try{
      const id = req.params.id
      const value = await Product.findByIdAndUpdate(id,{
        Productname:req.body.productname,
        Category:req.body.category,
        Price:req.body.price,
        Stock:req.body.stock,
        Model:req.body.model,
        Description:req.body.description,
       
      },{new:true})
      if(!value){
        res.render('adUpProduct',value)
      }else{
        if (req.files && req.files.length > 0) {
          const newImages = req.files.map(file => file.path.substring(6))
          value.Image = value.Image.concat(newImages);
        } else {
          value.Image = value.Image;
        }
        if (!value) {
          console.log("Product not found");
          res.status(404).send("Product not found");
          return;
        }
        await value.save();
        res.redirect("/viewProduct");
      }
    }catch(error){
      console.log(error)
    }
  }else{
    res.redirect('/admin')
  }
}

const deleteProduct = async(req,res)=>{
  if(req.session.addata){
    try{
      const id = req.params.id
      const result = await Product.findByIdAndDelete({_id:id});
      if(result){
        const prlist = await Product.find()
        res.render('adviewProduct',{prlist})
      }
      else{
        res.json({msg:'User not found'})
      }
    }catch(err){
      console.log(err)
      res.json({msg:err.message})
    }
  }
}

const listProduct = async(req,res)=>{
  const id = req.params.id
  const productli = await Product.findOne({_id: id});
  if(productli){
    productli.isListed = !productli.isListed
    productli.save()
    res.redirect('/viewProduct')
  }else{
    res.status(404).send('product is not found')
  }
}

module.exports = {
  addProduct,
  adpostProduct,
  viewproductlist,
  updatepro,
  updatepropost,
  deleteProduct,
  listProduct
}