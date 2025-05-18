import mongoose from "mongoose";

import { DB_NAME } from "../constant.js";

const connectDB = async()=>{
  try{
    const connenctionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`MONGODB connected: ${connenctionInstance.connection.host}`);
  }catch(err){
    console.log("MONGODB connnection error",err);
    process.exit(1);
  }
}

export default connectDB;