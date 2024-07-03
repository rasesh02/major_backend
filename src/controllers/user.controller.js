import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError } from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

//methods are created

const generateAccessandRefreshTokens=async(userId)=>{
    try{
       const user=await User.findById(userId);
       const accessToken=user.generateAccessToken();
       const refreshToken=user.generateRefreshToken();
       user.refreshToken=refreshToken;
       await user.save({validateBeforeSave:false});
       return {accessToken,refreshToken}
    }
    catch(err){
        console.log(err);
        throw new ApiError(500,"Error while generating access or refresh token")
       
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    const {username,fullName,email,password}=req.body;
    if([username,fullName,email,password].some((field)=>
     field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }
    const existingUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existingUser){
        throw new ApiError(409,"User already exists");
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
   // const coverImageLocalPath=req.files?.coverImage[0]?.path;
   
   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
       coverImageLocalPath = req.files.coverImage[0].path
   }
   
    if(!avatarLocalPath){
        throw new ApiError(400,"Some Error occurred while loading avatar ");
    }

   const avatar=await uploadOnCloudinary(avatarLocalPath);
   const coverImage=await uploadOnCloudinary(coverImageLocalPath);
   if(!avatar){
    throw new ApiError(400,"Avatar is required ");
   }
   const user=await User.create({
    fullName,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username:username.toLowerCase(),
    password
   })
   //check is db is not empty
   const createdUser=await User.findById(user._id).select("-password -refreshToken")
   if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering user")
   }
   return res.status(201).json(
    new ApiResponse(200,createdUser,"User registration successful")
   )
})

const loginUser=asyncHandler(async(req,res)=>{
    //user info
    //check valid info
    //user exist?
    //generate access and refresh tokens
    //send cookies
    const {username,email,password}=req.body;
    if(!username && !email) throw new ApiError(400,"User information required");
    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user)  throw new ApiError(404,"User does not exists");

    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid) throw new ApiError(401,"Incorrect Password")

    const {accessToken,refreshToken}=await generateAccessandRefreshTokens(user._id); 
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
    const options={
        httpOnly: true,
        secure: true,
    }
    res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
    .json(
       new ApiResponse(200,
        {
            user: loggedInUser,accessToken,refreshToken
        },
        "User successfully loggedIn"
       )
    )
})
const logoutUser=asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(req.user._id,
    {
       $unset:{refreshToken:1 } //remove field from document-> error for $set refreshToken: undefined
   },
    {new: true,}) 
   const options={
    httpOnly: true,
    secure: true,
    }
    return res.status(200).clearCookie("accessToken",options)
    .clearCookie("refreshToken",options).json(new ApiResponse(200,{},"User logged Out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken) throw new ApiError(401,"unauthorised request")
    //this token has original values not encrpyted values
   try {
     const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     const user=await User.findById(decodedToken?._id); // as our refeshtoken consists of ._id =>check user model
     if(!user) throw new ApiError(401,"Invalid Refresh Token");
     if(incomingRefreshToken!==user?.refreshToken) throw new ApiError(401,"Refresh token expired")
     const {accessToken,newRefreshToken}=await generateAccessandRefreshTokens(user._id);
     const options={
         httpOnly: true,
         secure: true,
     }
     res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newRefreshToken,options)
     .json(
        new ApiResponse(200,
         {
             accessToken,refreshToken: newRefreshToken
         },
         "access token refreshed"
        )
     )
   } catch (error) {
       throw new ApiError(401,error?.message ||"invalid refresh Token")
   }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    //old and current password
    //verify old password
    
    const {oldPassword,newPassword}=req.body;
    const user=await User.findById(req.user?._id);
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect) throw new ApiError(400,"Invalid old password");
    user.password=newPassword;
    await user.save({validateBeforeSave:false})
    return res.status(200).json(new ApiResponse(200,{},"Password reset successful"));
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"User fetched successful"));
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {username,fullName,email}=req.body;
   if(!username || !fullName || !email) throw new ApiError(400,"some field is missing")
    const user=await User.findByIdAndUpdate(req.user?._id,{
       $set:{
        fullName:fullName,
        email:email,
        username:username,
       }
    },{new:true}).select("-password");
    return res.status(200).json(new ApiResponse(200,user,"User details updated successfully")); 
})

const updateAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path;
    if(!avatarLocalPath) throw new ApiError(400,"Can't update avatar because file is missing")
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url) throw new ApiError(400,"Can't update avatar because there was an error while uploading avatr")
    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{avatar: avatar.url}
    },{new:true}
   ).select("-password");
   return res.status(200).json(new ApiResponse(200,user,"update avatar successful"));
})


const updateCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path;
    if(!coverImageLocalPath) throw new ApiError(400,"Can't update avatar because file is missing")
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage.url) throw new ApiError(400,"Can't update avatar because there was an error while uploading avatr")
    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{coverImage: coverImage.url}
    },{new:true}
   ).select("-password");
   return res.status(200).json(new ApiResponse(200,user,"update coverImage successful"));
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params;
    if(!username?.trim()) throw new ApiError(400,"Username is missing");
    const channel=await User.aggregate([
    {
        $match: {username: username?.toLowerCase()}
    },
    {
        $lookup:{
            from:"subscriptions", //Subscription schema will be stored as subscriptions in db
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },
    {
        $lookup:{
            from:"subscriptions", //Subscription schema will be stored as subscriptions in db
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
            // button to show subscribed if a channel is subscribed or show subscribe if it is not
            isSubsrcibed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then: true,
                    else : false,
                }
            }
        }
    },{
        $project:{
            username:1,
            fullName:1,
            email:1,
            subscribersCount:1,     
            channelsSubscribedToCount:1,
            isSubsrcibed:1,
            avatar:1,
            coverImage:1,
        }
    }
])
   if(!channel?.length) throw new ApiError(404,"channel does not exists")
   return res.status(200).json(new ApiResponse(200,channel[0],"User channel fetched"))
})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user =await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            }
        },
        {
            $lookup:{
               from:"videos",
               localField:"watchHistory",
               foreignField:"_id",
               as:"watchHistory",
               pipeline:[
                {
                    $lookup:{
                        from:"user",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                            {
                                $project:{
                                    username:1,
                                    fullName:1,
                                    avatar:1,

                                }
                            }
                        ]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first:"$owner",
                        }
                    }
                }
               ]
            
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"Watch History fetched"));
})


export {registerUser,loginUser,logoutUser,refreshAccessToken,
    changeCurrentPassword,getCurrentUser,updateAccountDetails,updateCoverImage,updateAvatar,getUserChannelProfile,
    getWatchHistory
};
