import dotenv from "dotenv"
import connectDb from "./db/index.js";
import { app } from "./app.js";

dotenv.config({path:'./.env'})
connectDb().then(()=>{
    app.listen(process.env.PORT || 5000,()=>{
        console.log(`listening at port ${process.env.PORT}`)
    })
})
.catch((err)=>{console.log("Error while listening",err)})

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