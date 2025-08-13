import mongoose from "mongoose";

 export async function connect(){
    try{
        mongoose.connect(process.env.MONGO_URL!)
        const connection=mongoose.connection
        connection.on("connected",()=>{
            console.log("Mongo Connected Successfully")
        })
        connection.on("error",(e)=>{
            console.log("Error"+e)
            process.exit()
        })
    }catch(e){
        console.log(e)

    }
 }