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


const getChannelStats = asyncHandler(async (req, res) => {
    //total videos
    //total subscriber
    //total likes on videos
    //total likes on community post
    //total likes on comment
    //total views
    const userId = req.user._id

    const totalVideos = await Video.countDocuments({owner:userId})

    if(totalVideos === null || totalvideos === undefined){
        throw new ApiError(500,"something went wrong while fetching total videos")
    }

    const totalSubscriber = await subscriptions.countDocuments({channel:userId})
    if(totalSubscriber === null || totalSubscriber === undefined){
        throw new ApiError(500,"something went wrong while fetching total subscriber")
    }

    const totallikesOnVideos = await Like.countDocuments({
        Video:{
            $in:await Video.find({owner:userId}).distinct("_id")
        }
    })
    
    if(totallikesOnVideos === null || totallikesOnVideos === undefined){
        throw new ApiError(500,"something went wrong while fetching total likes on vides")
    }


    const totallikesOnPost= await Like.countDocuments({
        communityPost:{
            $in:await communityPost.find({owner:userId}).distinct("_id")
        }
    })

    if(totallikesOnPost === null || totallikesOnPost === undefined){
        throw new ApiError(500,"something went wrong while fetching total likes on post")
    }

    const totallikesOnComment = await Like.countDocuments({
        Comment:{
            $in:await Comment.find({owner:userId}).distinct("_id")
        }
    })

    if(totallikesOnComment === null || totallikesOnComment === undefined){
        throw new ApiError(500,"something went wrong while fetching total likes on comment")
    }


    const totalViews = await Video.aggregate([
        {
            $match:{
                owner:userId,
            },
        },
        {
            $group:{
                _id:null,
                totalViews:{
                    $sum:"$views"
                }
            }
        }
    ])

    if(totalViews === null || totalviews === undefined){
        throw new ApiError(500,"something went wrong while fetching total views")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{
            totalSubscriber,
            totalVideos,
            totalViews,
            totallikesOnPost,
            totallikesOnVideos,
            totallikesOnComment,
        },"channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const allVideos = await Video.find({
        owner:userId,
    }).sort({
        createdAt:-1,
    })

    if(!allVideos||allVideos.length===0){
        throw new ApiError(400,"no videos found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,allVideos,"all videos in this channel fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }