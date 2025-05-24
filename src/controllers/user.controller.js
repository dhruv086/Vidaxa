import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/apiError.js";
import {User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../../utils/cloudinary.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import mongoose, { set, trusted } from "mongoose";
import app from "../app.js";


const generateAccessandRefreshTokens = async(userId)=>{
  try{
    const user = await User.findById(userId);
    const accessToken=user.generateAccessToken();
    console.log(accessToken)
    const refreshToken=user.generateRefreshToken();
    console.log(refreshToken)

    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false})

    return {refreshToken,accessToken}
  }catch(error){
    console.log(error)
    throw new ApiError(500,"Something went wrong while generating refresh and access token")
  }
}


//register user

const registerUser= asyncHandler( async(req,res)=>{




  // steps to handle register
  //get user detail form the frontend
  // validation/sanitization
  //check if user already exist or not
  //check for images ,check for avatar
  //upload them to cloudinary,avatar
  //create user object -create user entry
  //remove password and refresh token from response
  //check for user creation
  //at the end return the response


  const {fullname,email,username,password} = req.body

  if(
    [fullname,email,username,password].some((field)=>field?.trim()==="")
  ){
    throw new ApiError(400,"all field are required")
  }

  const existedUser = await User.findOne({
    $or : [{username},{email}]
  })

  if(existedUser){
    throw new ApiError(409,"user already exists with same email or username")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required");
  }

const avatar = await uploadOnCloudinary(avatarLocalPath);
const coverImage = await uploadOnCloudinary(coverImageLocalPath);

if(!avatar){
  throw new ApiError(400,"Avatar file is req")
}
console.log(avatar);


const user = await User.create({
  fullname,
  avatar:avatar.url,
  coverImage:coverImage?.url || "",
  email,
  password,
  username:username.toLowerCase()
})

const createdUser = await User.findById(user._id).select(
  "-password -refreshToken"
)

if(!createdUser){
  throw new ApiError(500,"spmething went wrong while registring the user")
}

return res.status(201).json(
  new ApiResponse(200,createdUser,"user registered successfully")
)
})



//login logic




const loginUser= asyncHandler(async(req,res)=>{
  // console.log(req.body)
  const {email,username,password} = req.body
  // console.log(email)
  if(!username && !email){
    throw new ApiError(400,"username or email is required");
  }

  const user = await User.findOne({
    $or: [{username},{email}]
  })

  if(!user){
    throw new ApiError(404,"user does not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if(!isPasswordValid){
    throw new ApiError(401,"password is incorrect")
  }

  const {refreshToken,accessToken}= await generateAccessandRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-refreshToken -password")

  const options ={
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,accessToken,refreshToken
      },
      "user logged in successfully"
    )
  )
})

const logoutUser = asyncHandler(async (req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )
  const options ={
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"user logged out"))
})

const refreshAccessToken  =asyncHandler(async(req,res)=>{
  const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
  }

  try {
    const decodedToken = JsonWebTokenError.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401,"invalid refresh token");
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"refresh token is either expired or invalid")
    }
    const options = {
      httpOnly:true,
      secure:true
    }
    const {accessToken,newRefreshToken} = await generateAccessandRefreshTokens(user._id);
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken,newRefreshToken},
        "access token refreshed successfully"
      )
    )
  } catch (error) {
    throw new ApiError(401,"invalid refresh token")
  }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body
  const user = User.findById(req.user?.id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
    throw new ApiError(401,"password is incorrect")
  }

  user.password = newPassword
  await user.save({validateBeforeSave:false});
  return res
  .status(200)
  .json(
    new ApiResponse(200,{},"password changed successfully")
  )

})

const getCurrentUser  =asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(200,req.user,"current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullname,email} = req.body
  if(!fullname || !email){
    throw new ApiError(401,"please fill all the field")
  }

  const user = await user.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullname,
        email:email
      }
    },
    {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"account details updated succesfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400,"Error while uploading on avatar")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400,"error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {
      new:true
    }

  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"Avatar image uploaded succefully")
  )
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath= req.file?.path
  if(!coverImageLocalPath){
    throw new ApiError(401,"cover image file is missing")
  }

  const coverImage = uploadOnCloudinary(coverImageLocalPath)

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {
      new:true
    }
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"cover image successfully updated")
  )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const {username}= req.params

  if(!username?.trim()){
    throw new ApiError(401,"username is missing")
  }

  const channel = await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase()
      }
    },
    {
      $lookup:{
        from: "subscriptions",
        localField:"_id",
        foreignField:"channel",
        as: "subscribers"
      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"
      }
    },
    {
      $addFields:{
        subscribersCount:{
          $size:"$subscribers"
        },
        channelsSubscribedToCount:{
          $size:"$subscribedTo"
        },
        isSubscribed:{
          $cond:{
            if: {$in :[req.user?._id,"$subscribers.subscriber"]},
            then:true,
            else:false
          }
        }
      }
    },
    {
      $project:{
        fullname:1,
        username:1,
        subscribersCount:1,
        channelsSubscribedToCount:1,
        isSubscribed:1,
        email:1,
        avatar:1,
        coverImage:1
      }
    }
  ])

  if(!channel?.length){
    throw new ApiError(404,"cahnnel does not exist");
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,channel[0],"user channel fetched successfully")
  )
})



const getWatchHistory =asyncHandler(async(req,res)=>{
  const user = await User.aggregate([
    {
      $match:{
        _id: mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from : "videos",
        localField: "watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullname:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ]
      }
    }
  ])


  return res
  .status(200)
  .json(
    new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully")
  )
})


export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
}