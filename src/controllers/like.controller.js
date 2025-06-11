import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/apiError.js";
import {User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../../utils/cloudinary.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import mongoose, { isValidObjectId, set, trusted } from "mongoose";
import app from "../app.js";
import { Video } from "../models/video.model.js";
import { subscriptions } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";






const toggleVideoLike = asyncHandler(async (req, res) => {
  const {videoId} = req.params
  
  const userId = req.user._id

  if(!isValidObjectId(videoId)){
    throw new ApiError(400,"invalid video is")
  }

  const existingLike = await Like.findOne({
    Video:videoId,
    likedBy:userId
  })

  if(existingLike){
    await Like.findByIdAndDelete(existingLike._id)

    return res
    .status(200)
    .json(
      ApiResponse(200,existingLike,"removed liked successfully")
    )
  }


 const liked = await Like.create({
    video:videoId,
    likedBy:userId
  })

  return res
  .status(200)
  .json(
    new ApiResponse(200,liked,"video liked successsfully")
  )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const {commentId} = req.params

  const userId = req.user._id

  if(!isValidObjectId(commentId)){
    throw new ApiError(400,"invalid comment id")
  }

  const existingCommentLike = await Like.findOne({
    comment : commentId,
    likedBy : userId
})

if(existingCommentLike){
  await Like.findByIdAndDelete(existingCommentLike._id)


  return res
  .status(200)
  .json(
    new ApiResponse(200,existingCommentLike,"liked on this comment removed successfully")
  )
}

const likedComment = await Like.create({
  comment:commentId,
  likedBy:userId
})
return res
      .status(200)
      .json(
        new ApiResponse(200,likedComment,"comment liked successfully")
      )

})

const toggleCommunityPostLike = asyncHandler(async (req, res) => {
  const {communityPostId} = req.params

  const userId = req.user._id

  if(!isValidObjectId(communityPostId)){
    throw new ApiError(400,"invalid invalid community post id")
  }

  const existingLike  = await Like.findOne({
    communityPost:communityPostId,
    likedBy:userId
  })

  if(existingLike){
    await Like.findByIdAndDelete(existingLike._id)

    return res
    .status(200)
    .json(
      new ApiResponse(200,existingLike,"like removed from the community post successfully")
    )
  }

  const likePost = await Like.create({
    communityPost:communityPostId,
    likedBy:userId
  })

  return res
  .status(200)
  .json(
    new ApiResponse(200,likePost,"community post has been liked successfully")
  )
})

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const likedVideos = await Like.find({
    likedBy:userId,


    video:{$exist:true}
  }).populate("video","_id title videoFile")

})

export {
  toggleCommentLike,
  toggleCommunityPostLike,
  toggleVideoLike,
  getLikedVideos
}