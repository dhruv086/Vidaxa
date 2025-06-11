import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/apiError.js";
import {User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../../utils/cloudinary.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import mongoose, { isValidObjectId, set, trusted } from "mongoose";
import app from "../app.js";
import { Video } from "../models/video.model.js";
import { subscriptions } from "../models/subscription.model.js";






const toggleVideoLike = asyncHandler(async (req, res) => {
  const {videoId} = req.params
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const {commentId} = req.params

})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const {tweetId} = req.params
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
  
})

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos
}