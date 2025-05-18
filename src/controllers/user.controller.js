import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/apiError.js";
import {User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../../utils/cloudinary.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import { trusted } from "mongoose";
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


export { registerUser , loginUser, logoutUser ,refreshAccessToken}