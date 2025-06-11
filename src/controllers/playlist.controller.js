import mongoose, {isValidObjectId} from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../../utils/apiError.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name){
      throw new ApiError(400,"please provide the name")
    }
    if(!description){
      throw new ApiError(400,"please provide the description")
    }



    const createplaylist = await Playlist.create({
      name,
      description,
      owner:req.user._id,
    })

    if(!createplaylist){
      throw new ApiError(400,"error creating playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,createplaylist,"playlist created successfully"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(isValidObjectId(userId)){
      throw new ApiError(400,"invalid user id")
    }

    const currentPlaylist = await Playlist.find({owner:userId})

    if(!currentPlaylist||currentPlaylist.length===0){
      throw new ApiError(400,"No playlist are found that are owned by this user")
    }


    return res
    .status(200)
    .json(
      new ApiResponse(200,currentPlaylist,"playlist fetch successfully")
    )
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
      throw new ApiError(400,"invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId).populate("videos")


    if(!playlist){
      throw new ApiError(400,"playlist does not exist")
    }

    return res
    .status(200)
    .json(
      new ApiResponse(200,playlist,"playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId)){
      throw new ApiError(400,"invalid playlist id")
    }
    if(!isValidObjectId(videoId)){
      throw new ApiError(400,"invalid video id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
      throw new ApiError(400,"playlist does not exist")
    }

    const video = await Playlist.findById(videoId)
    if(!video){
      throw new ApiError(400,"video does not exist")
    }

    if(playlist.videos.includes(videoId)){
      throw new ApiError(400,"video is already in the playlist")
    }

    playlist.videos.push(videoId);
    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"video added to playlist successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId)){
      throw new ApiError(400,"invalid playlist id")
    }
    if(!isValidObjectId(videoId)){
      throw new ApiError(400,"invalid video id")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
      throw new ApiError(400,"playlist does not exist")
    }

    const video = await Playlist.findById(videoId)
    if(!video){
      throw new ApiError(400,"video does not exist")
    }

    if(playlist.videos.includes(videoId)){
      throw new ApiError(400,"video is not in the plalist")
    }

    await Playlist.updateOne(
      {_id:playlistId},
      {$pull:{videos:videoId}}
    )

    return res
    .status(200)
    .json(200,null,"video deleted from the playlist successfully")

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
      throw new ApiError(400,"invalid playlist id")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist){
      throw new ApiError(400,"error deleting playlist")
    }

    return res
    .status(200)
    .json(
      new ApiResponse(200,deletedPlaylist,"playlist deleted successfully")
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!isValidObjectId(playlistId)){
      throw new ApiError(400,"invalid playlist id")
    }
    if(!name||!description){
      throw new ApiError(400,"name and description cannot be empty")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
      {
        $set:{
          name,
          description,
        },
      },
      {
          new:true,
      }
    )

    if(!updatedPlaylist){
      throw new ApiError(400,"error in updating the playlist")
    }

    return res
    .status(200)
    .json(
      new  ApiResponse(200,updatedPlaylist,"playlist has been updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}