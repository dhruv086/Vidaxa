import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../../utils/apiError.js";
import {ApiResponse} from "../../utils/ApiResponse.js"
import {asyncHandler} from "../../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../../utils/cloudinary.js"
import { getVideoDuration } from "../../utils/GetDuration.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query="", sortBy = "createdAt", sortType="desc", userId } = req.query

    if(!req.user){
      throw new ApiError(400,"user need to be logged in")
    }

    const match = {
      ...(query ? { title: { $regex: query, $options: "i" } } : {}),
      ...(userId ? { owner: mongoose.Types.ObjectId(userId) } : {}),
    };

    const videos = await Video.aggregate([
      {
        $match:match,
      },
      {
        $lookup:{
          from:"users",
          localField:"owner",
          foreignField:"_id",
          as:"asVideosByOwner",
        },
      },
      {
        $project: {
          videoFile: 1, 
          thumbnail: 1,
          title: 1,
          description: 1,
          duration: 1,
          views: 1,
          isPublished: 1,
          owner: {
            $arrayElemAt: ["$videosByOwner", 0],
          },
        },
      },
      {
        $sort:{
          [sortBy]:sortType==="desc"?-1:1,
        }
      },
      {
        $skip:(page-1)*parseInt(limit),
      },
      {
        $limit:parseInt(limit)
      },
    ]);

    if (!videos?.length) {
      throw new ApiError(404, "Videos are not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));

})

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if(!title){
      throw new ApiError(400,"title should not be empty")
    }

    if(!description){
      throw new ApiError(400,"description should not be empty")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!videoLocalPath){throw new ApiError(400,"please upload the video");}
    if(!thumbnailLocalPath){throw new ApiError(400,"please upload the thumbnail");}

      
        const duration = await getVideoDuration(videoLocalPath);
        if(!duration){
          throw new ApiError(400,"error fetching duration of the video")
        }
        // const duration=10;
  
        const videoFile = await uploadOnCloudinary(videoLocalPath)
        if(!videoFile){
          throw new ApiError(400,"cloudinary error: video uploading error")
        }
  
        const thumbnailfile = await uploadOnCloudinary(thumbnailLocalPath)
        if(!thumbnailfile){
          throw new ApiError(400,"cloudinary error: thumbnail uploading error")
        }
  
        const videoDetails = await Video.create({
          videoFile:videoFile.url,
          thumbnail:thumbnailfile.url,
          title,
          description,
          owner:req.user?._id,
          duration,
          isPublished:true,
        })
  
        if(!videoDetails){
          throw new ApiError(400,"error while uploading video")
        }
  
        return res
        .status(200)
        .json(
          new ApiResponse(200,videoDetails,"video uploaded successfully")
        )
  
      
  })

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
      throw new ApiError(400,"invalid video id")
    }

    const video = await Video.findById(videoId).populate("owner","fullname email")

    if(!video){
      throw new ApiError(400,"error finding video")
    }

    return res
    .status(200)
    .json(
      new ApiResponse(200,video,"video fetched successfully")
    )

  })

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
      throw new ApiError(400,"invalid video id")
    }

    const {title,description}=req.body


    let updateData = {title,description}

    if(req.file){
      const thumbnailLocalPath = req.file.path;

      if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbail does not exist")
      }

      const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)


      updateData.thumbnail = thumbnail.url
    }


    const updatedData = await Video.findByIdAndUpdate(
      videoId,
      {$set:updateData},
      {new:true,runValidators:true}
    )


    if(!updatedData){
      throw new ApiError(400,"error updated video details")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,updateData,"data updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
      throw new ApiError(400,"invalid video id")
    }

    const isVideoDeleted = await Video.findByIdAndDelete(videoId)


    if(!isVideoDeleted){
      throw new ApiError(400,"error deleting video or video does not exist");
    }

    return res
    .status(200)
    .json(
      new ApiResponse(200,isVideoDeleted,"video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
      throw new ApiError(400,"Invalid video id")
    }

    const video = await Video.findById(videoId)

    if(!video){
      throw new ApiError(400,"video does not exist")
    }

    video.isPublished=!video.isPublished

    await video.save()

    return res.
    status(200)
    .json(
      new ApiResponse(200,video ,"video publish status toggled")
    )
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
 togglePublishStatus
};