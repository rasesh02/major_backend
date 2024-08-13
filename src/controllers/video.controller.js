import  mongoose,{isValidObjectId} from "mongoose";
import {Video} from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    
    var videoAggregate;
    try{
      videoAggregate=Video.aggregate([
        {
         $match:{

         }
      },
      {
        $lookup:{
            from:"video",
            localField: "owner",
            foreignField: "_id",
            as:"owner",
            pipeline:
            [
                {
                    $project:{
                        _id: 1,
                        fullName:1,
                        avatar: "$avatar.url",
                        username: 1,
                    }
                }
            ]
        }
      },
      {
        $addFields:{
            
        }
      }
    ])
    }
    catch(err){}
 
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body;
    if(title.length===0 || description.length===0 ) throw new ApiError(400,"Title or Description missing");
    const videoLocalPath=req.files?.videoFile[0]?.path;
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path;
    if(!videoLocalPath ||  !thumbnailLocalPath){
        throw new ApiError(400,"All fields are required")
    }
   const video= await uploadOnCloudinary(videoLocalPath);
   if(!video) throw new ApiError(500,"Error uploading video");
   const thumbnail=await uploadOnCloudinary(thumbnailLocalPath);
   if(!thumbnail) throw new ApiError(500,"Error uploading thumbnail");
  const uploadedVideo= await Video.create({
     videoFile: video.url || "",
     thumbnail: thumbnail.url || "",
     title,
     description,
     duration: video.duration,
     owner:req.user._id,
   })
   return res.status(200).json(new ApiResponse(200,uploadedVideo,"video is published"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)) throw new ApiError(400,"Invalid video id")
    const video=await Video.findById(videoId);
    if(!video) throw new ApiError(404,"Video unavailable");
    res.status(200).json(new ApiResponse(200,video,"Video fetched"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!isValidObjectId(videoId)) throw new ApiError(400,"Invalid video id");
    const {title,description}=req.body;
    if(title.length===0 || description.length===0 ) throw new ApiError(400,"Title and Description can't be Null");
    const { path: thumbnailLocalPath } = req.file || {};
    if(!thumbnailLocalPath)
        {
            throw new ApiError(400,"Thumbnail is required")
        }
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath);
    const updatedVideo=await Video.findByIdAndUpdate(videoId,{
        $set:{
            title,
            thumbnail: thumbnailLocalPath && thumbnail.url,
            description,
        }
    },{new: true});
    if(!updatedVideo)
        {
            throw new ApiError(500,"Video was not updated due to some error")
        }
    return res.status(200).json(new ApiResponse(200,updatedVideo,"Video updated"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");
    const deleteVideo=await Video.findByIdAndDelete(videoId);
    if(!deleteVideo)
        {
            throw new ApiError(500,"There was a problem while deleting the video")
        }

        return res.status(200).json(new ApiResponse(200,{},"Video was deleted Successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}