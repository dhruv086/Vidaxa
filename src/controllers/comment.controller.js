import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/apiError.js";
import {User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../../utils/cloudinary.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import mongoose, { isValidObjectId, set, trusted, Types } from "mongoose";
import app from "../app.js";
import { Video } from "../models/video.model.js";
import { subscriptions } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";





const getVideoComments = asyncHandler(async (req, res) => {
  
  const {videoId} = req.params
  const {page = 1, limit = 10} = req.query

  if(!isValidObjectId(videoId)){
    throw new ApiError(400,"invalid video id")
  }

  const allComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"video",
        foreignField:"_id",
        as:"commentOnWhichVideo"
      },
    },
    {
     $lookup:{
      from:"users",
      localField:"owner",
      foreignField:"_id",
      as:"ownerOfComment"
     }
    },
    {
      $project:{
        content:1,
        owner:{
          $arrayElemAt:["$ownerOfComment",0],
        },
        video:{
          $arrayElemAt:["$commentOnWhichVideo",0],
        },
        createdAt:1,
      },
    },
    {
      $sort:{
        createdAt:-1,
      }
    },
    {
      $skip:(page-1)*parseInt(limit),
    },
    {
      $limit:parseInt(limit),
    }
  ])

  if(!allComments || allComments.length===0){
    throw new ApiError(400,"no comments exists")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,allComments,"all comments fetched successfully")
  )

})

const addComment = asyncHandler(async (req, res) => {
  const videoId= req.params


  const comment = req.body

  if(!isValidObjectId(videoId)){
    throw new ApiError(400,"invalid api error")
  }


  if(!req.user){
    throw new ApiError(400,"user need to be logged in")
  }


  if(!comment){
    throw new ApiError(400,"comment field cannot be empty")
  }


  const addComment  =await Comment.create({
    comment,
    owner:req.user,
    video:videoId,
  })


  if(!addComment){
    throw new ApiError(400,"error in adding comment")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,addComment,"comment added successfully")
  )
})

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const {commentId}= req.params

  const {comment}= req.body

  if(!isValidObjectId(commentId)){
    throw new ApiError(400,"invalid comment id")
  }

  if(!req.user){
    throw new ApiError(400,"user needs to be logged in")
  }

  if(!comment){
    throw new ApiError(400,"comment cannot be empty")
  }

  const updatedComment  =await Comment.findOneAndUpdate(
    {
      id:commentId,
      owner:req.user._id,
    },
    {
      $set:{
        content
      }
    },
    {
      new:true,
    }
  )

  if(!updateComment){
    throw new ApiError(400,"error in updating the comment")
  }

  return res
  .status(200)
  .json(200,updateComment,"comment updated successfully");
})

const deleteComment = asyncHandler(async (req, res) => {
  const {commentId}= req.params

  if(!isValidObjectId(commentId)){
    throw new ApiError(400,"invalid comment id")
  }
  if(!req.user){
    throw new ApiError(400,"user need to be logged in")
  }

  const deletedComment= await Comment.findOneAndDelete({
    id:commentId,
    owner:req.user._id,
  })

  if(!deletedComment){
    throw new ApiError(400,"error in deleting the comment")
  }
  return res
  .status(200)
  .json(200,deletedComment,"comment deleted successfully")
})

export {
  getVideoComments, 
  addComment, 
  updateComment,
   deleteComment
  }