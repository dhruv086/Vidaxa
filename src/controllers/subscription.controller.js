import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/apiError.js";
import {User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../../utils/cloudinary.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import mongoose, { isValidObjectId, set, trusted } from "mongoose";
import app from "../app.js";
import { Video } from "../models/video.model.js";
import { subscriptions } from "../models/subscription.model.js";


const toggleSubscription = asyncHandler(async (req, res) => {
  const {channelId} = req.params
  // TODO: toggle subscription

  if(!channelId){
    throw new ApiError(400,"invalid channel id")
  }

  const subscriberId= await req.user._id

  const channel = await User.findById(channelId)

  if(!channel){
    throw new ApiError(400,"channel does not exist")
  }

  if(subscriberId.toString()===channel.toString()){
    throw new ApiError(400,"you cannot subscribe to your own channel")
  }

  const existingUser = await subscriptions.findOne({
    subscriber:subscriberId,
    channel: channelId,
  })

  if(existingUser){
    await subscriptions.findByIdAndDelete(existingUser._id)
    return res
    .status(200)
    .json(
      new ApiResponse(200,existingUser,"user unsubscribed successfully")
    )
  }

  await subscriptions.create({
    subscriber:subscriberId,
    channel:channelId,
  })
  return res
  .status(200)
  .json(
    new ApiResponse(200,{},"user subscribed successfully")
  )


})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const channelId = req.user._id;



  if(!isValidObjectId(channelId)){
    throw new ApiError(400,"invalid channel id")
  }

  const channel = await subscriptions.findById(channelId)

  


  const subscribersDetails = await subscriptions.find({
    channel:channelId,
  }).populate("subscriber","_id fullname email")

  if(!subscribersDetails){
    throw new ApiError(400,"no subscriber found")
  }


  return res
  .status(200)
  .json(
    new ApiResponse(200,subscribersDetails,"subscribers fetched successfully")
  )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const  subscriberId  = req.user._id

  if(!isValidObjectId(subscriberId)){
    throw new ApiError(400,"invalid subscriber id")
  }

  

  const channelsDetail = await subscriptions.find({
    subscriber:subscriberId,
  }).populate("channel","_id fullname email")


  if(!channelsDetail || channelsDetail.length===0){
    throw new ApiError(400,"no channel are found that are subscribed by this user")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,channelsDetail,"channel fetched successfully")
  )
})

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
}