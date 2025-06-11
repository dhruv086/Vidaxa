import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/apiError.js";
import {User } from "../models/user.model.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import mongoose, { set, trusted } from "mongoose";
import app from "../app.js";


const getChannelStats = asyncHandler(async (req, res) => {
})

const getChannelVideos = asyncHandler(async (req, res) => {
})

export {
    getChannelStats, 
    getChannelVideos
    }