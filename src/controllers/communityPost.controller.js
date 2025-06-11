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
import { communityPost } from "../models/communityPost.model.js";






const createPost = asyncHandler(async (req, res) => {
  const {content} = req.body

  const ownerId = req.user._id

  if(!content){
    throw new ApiError(400,"content of the post cannot be empty")
  }

  const newPost = await communityPost.create({
    content,
    owner:ownerId,
  })

  if(!newPost){
    throw new ApiError(400,"error in creating new post")
  }
  

  return res
  .status(200)
  .json(
    new ApiResponse(200,newPost,"new community post has been created successfully")
  )
})

const getUserPost = asyncHandler(async (req, res) => {
  const {userId} = req.params

  if(!isValidObjectId(userId)){
    throw new ApiError(400,"invalid user id")
  }

  const posts = (await communityPost.find({owner:userId})).sort({createdAt:-1})

  
  if(!posts||posts.length===0){
    throw new ApiError(400,"no post found")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,posts,"all posts have been fetched successfully")
  )

})

const updatePost = asyncHandler(async (req, res) => {
  const {postId} = req.params
  const {content} = req.body

  const user=req.user._id

  if(!isValidObjectId(postId)){
    throw new ApiError(400,"invalid post id")
  }

  if(!content){
    throw new ApiError(400,"post content cannot be empty")
  }

  const post = await communityPost.findById(postId)

  if(!post){
    throw new ApiError(400,"post does not exist")
  }
  if(post.owner.toString()!==user.toString()){
    throw new ApiError(400,"you can only update your own post")
  }

  const updatedPost = await communityPost.findByIdAndUpdate(
    postId,
    {
      $set:{
        content
      }
    },
    {
      new:true
    }
  )

  if(!updatedPost){
    throw new ApiError(400,"error while updating the post")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,updatedPost,"post has been updated successfully")
  )
})

const deletePost = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const {postId} = req.params

  const userId=req.user._id
  if(!isValidObjectId(postId)){
    throw new ApiError(400,"invalid post id")
  }

  const post= await communityPost.findById(postId)
  
  if(!post){
    throw new ApiError(400,"post does not exist")
  }

  if(post.owner.toString()!==userId.toString()){
    throw new ApiError(400,"you can only delete post that belongs to your account")
  }

  const deletedpost = await communityPost.findByIdAndDelete(postId)

  if(!deletedpost){
    throw new ApiError(400,"error while deleting your post")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,deletedpost,"post deleted successfully")
  )

})

export {
  createPost,
  getUserPost,
  updatePost,
  deletePost
}