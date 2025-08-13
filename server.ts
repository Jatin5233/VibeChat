import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors"

const port=3001;
const app=express();
const server=createServer(app)

const io=new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"],
        credentials:true
    }
})

app.use(cors(
    {
        origin:"http://localhost:3000",
        methods:["GET","POST"],
        credentials:true
    }
))

io.on("connection",(socket)=>{
    console.log("user connected")
    console.log("id",socket.id)
    socket.emit("welcome","welcome to server")
})

server.listen(port,()=>{
    console.log("server is listing port",port)
})