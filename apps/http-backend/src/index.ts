import express from "express";
import jwt from "jsonwebtoken";
import z from "zod"
import cors from "cors"
import { JWT_SECRET } from "@repo/backend-common/config"
import { createUserSchema, roomSchema, siginSchema } from "@repo/common/types"
import { authMiddleware } from "./middleware";
import bcrypt from "bcrypt";
import { prismaClient } from "@repo/db/client"
const app = express();

app.use(cors());
app.post("/signup", async function (req, res) {
  const parsedData = createUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({ message: "invalid format" });
    return;
  }

  const { email, password, name } = parsedData.data;

  const hashedPassword = await new Promise<string>((resolve, reject) => {
    bcrypt.hash(password, 10, (err: Error | undefined, hash: string) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
  const user = await prismaClient.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  res.json({
    message: "signup succesfull",
    userId: user.id
  })
});
app.post("/sigin", async function (req, res) {
  const parsedData = siginSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "incorrect format"
    })
    return
  }
  const password = parsedData.data?.password;
  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data?.username
    }
  })
  if (!user) {
    res.json({
      message: "user not found"
    })
    return
  }
  const hashedPassword = user.password;
  const isMatch = await bcrypt.compare(password, hashedPassword);

  const userId = user?.id;
  const token = jwt.sign({
    userId
  }, JWT_SECRET);

  res.json({
    token
  })
})


app.post("/room", authMiddleware, async function (req, res) {
  const parsedData = roomSchema.safeParse(req.body);
  if(!parsedData.success){
    res.json({
      message : "incorrect format"
    })
    return;
  }
  //@ts-ignore
  const userId = req.userId;
  try{
  const room = await prismaClient.room.create({
    data:{
      slug : parsedData.data.name,
      adminId : userId
    }
  })
  res.json({
    roomId : room.id
  })
}catch(e){
  res.json({
    message : "room already exists"
  })
}
})

app.get("chats/:roomId" ,async function(req,res){
  const roomId = Number(req.params.roomId);

  const chats = await prismaClient.chat.findMany({
    where :{
      roomId : roomId
    },
    orderBy : {
      id : "desc"
    },
    take : 50
  })
  res.json({
    chats
  })
})

app.get("/room/:slug" ,async function(req,res){
  const slug = req.params.slug;
  const room = await prismaClient.findFirst({
    where : {
      slug : slug
    }
  })

  res.json({
    room
  })
})

app.listen(3000);