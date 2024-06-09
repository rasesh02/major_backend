import dotenv from "dotenv"
import connectDb from "./db/index.js";

dotenv.config({path:'./env'})
connectDb();

/*import mongoose from "mongoose";
import { DB_NAME } from "./constants";
;(async ()=>{
    try{
     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    }
    catch(error){
     console.log(error);
     throw err
    }
})()*/