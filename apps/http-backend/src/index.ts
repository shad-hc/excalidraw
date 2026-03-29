import express from "express";
import jwt from "jsonwebtoken";
import z from "zod"
import { JWT_SECRET } from "@repo/backend-common/config"
import {createUserSchema} from "@repo/common/types"
const app = express();

app.post("/signup",function(req,res){
   //db call
   const result = createUserSchema.safeParse(req.body);
   if(!result){
    res.json({
        message : "incorrct credentials format"
    })
   }
   res.json({
    message : "sigup successfull"
   })
})

app.post("/sigin" ,function (req,res){
     
  //db call 
  const userId = 1;
  jwt.sign({
    userId
  },JWT_SECRET);
})


app.post("/room" ,function(req,res){
  
})

app.listen(3000);