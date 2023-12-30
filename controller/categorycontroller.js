const express = require('express');
const { collection } = require('../model/users');
const users = require('../model/users');
const adrouter = express.Router();
const Category = require('../model/category')
const Product = require('../model/products')
const path = require('path')

const disCategory = (req,res)=>{
  res.render('adminCategory')
}

const categorypost = async(req,res)=>{
  if((req.body.categoryname===null || req.body.categoryname.trim() === "" )){
    res.render('adminCategory',{message:"Fill out the field"})
  }else if(req.session.addata){
    try{
      const cat = {category:req.body.categoryname}
      const category = req.body.categoryname
      const isPresent = await Category.findOne({ category : {$regex: new RegExp('^'+category+'$','i') }})
      if(isPresent === null){
        const value = await Category.insertMany([cat])
        res.render('adminCategory',{message:"Inserted successfully"}) 
      }else{
        res.render('adminCategory',{message:"Already exist"})
      }
    }catch(error){
      console.log(error)
    } 
  }else{
    res.redirect('/admin')
  }
}  

//See the category render
const disviewcategory = async(req,res)=>{
  console.log("disview")
  if(req.session.addata){
    try{
      const x = await Category.find()
      res.render('viewCategory',{datas:x})
    }catch(error){
      console.log(error)
    }
  }else{
    console.log("admin")
    res.redirect('/admin')
  }
}

//for updating cat


//display view cat
const viewcategory = (req,res)=>{
  console.log("view")
  res.redirect('/disviewcat')
}

//update cat get
const updatecat =async(req,res)=>{
  if(req.session.addata){
    try{
      const id = req.params.id
      const x = await Category.findById(id)
      res.render('updateCategory',{ datas:x })
    }
    catch(error){
      console.log(error)
    }
  }else{
    res.redirect('/admin')
  }
}

const categoryupdatepost = async(req,res)=>{
  const id = req.params.id
  const datas = await Category.findById(id)
  if((req.body.categoryname===null || req.body.categoryname.trim() === "" )){
    res.render('updateCategory',{message:"fill out the ",datas})
  }else if(req.session.addata){
    try{
      const id = req.params.id
      const category = req.body.categoryname
      const isPresent = await Category.findOne({ category: category })
      if(isPresent === null){
        await Category.findByIdAndUpdate(id,{
          category:req.body.categoryname
        })
        .then(x=>{
          res.redirect('/viewcategory')
          // res.render('updateCategory',{datas:x,message:"Updated"})
        })
      }else{
        res.redirect('/viewcategory')
      }

    }catch(error){
      console.log(error)
    }
  }else{
    res.redirect('/admin')
  }
}

const deletecategory = async(req,res)=>{
  if(req.session.addata){
    try{

      const id = req.params.id
      const result = await Category.findByIdAndDelete({_id:id})
      if(result){
        const datas = await Category.find()
        res.render('viewCategory',{datas})
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


module.exports = {
  disCategory,
  categorypost,
  disviewcategory,
  viewcategory,
  updatecat,
  categoryupdatepost,
  deletecategory,
}