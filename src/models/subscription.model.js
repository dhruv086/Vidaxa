import mongoose, { Schema } from "mongoose";

const subscriptionSchema =new Schema({
  subscriber:{
    types:Schema.Types.ObjectId,
    ref:"user"
  },
  channel:{
    types:Schema.Types.ObjectId,
    ref:"user"
  }
},{timestamps:true})

export const subscriptions = mongoose.model("Subscription",subscriptionSchema)