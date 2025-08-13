"use client"
import React from 'react'
import { useEffect } from 'react'
import {io} from "socket.io-client"

export default function Home() {
  const socket=io("http://localhost:3001")
  useEffect(()=>{
    socket.on("welcome",(s)=>{
      console.log(s)
    })
  },[])
  return (
    <div>
      app
    </div>
  )
}
