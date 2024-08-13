import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError } from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import mongoose, { isValidObjectId } from "mongoose";
import {Comment} from "../models/comment.model.js"



const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query;
    if(!isValidObjectId(videoId)) throw new ApiError(404,"Video not found");
    const allComments= await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(`${videoId}`),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                }
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likedBy",
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
            $limit:limit
        }
    ])
    if(!allComments || !allComments.length>0){
        throw new ApiError(400,"error occured whie finding comments")
    }
    return res.status(200).json(new ApiResponse(200,allComments,"All comments fetched"));
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId}=req.params;
    const {content}=req.body;
    if(!isValidObjectId(videoId)) throw new ApiError(404,"Video not found");
    if(content) throw new ApiError(400,"No comment fetched");
   const createdComment= await Comment.create({
        content: content,
        video: videoId,
        owner: req.user._id,
    })
    return res.status(200).json(new ApiResponse(200,createdComment,"comment added"));
})

const updateComment = asyncHandler(async (req, res) => {
   const {commentId}=req.params;
   const {content}=req.body;
   if(!commentId?.trim()) throw new ApiError(400,"commentid missing from params");
   if(!content) throw new ApiError(400,"empty content");
  const updatedComment= await Comment.findByIdAndUpdate(commentId,{
      $set:{
         content,
      }
   },{new: true})
   return res.status(200).json(new ApiResponse(200,updatedComment,"comment updated"));
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId}=req.params;
    if(!commentId?.trim()) throw new ApiError(400,"commentid missing from params");
    await Comment.findByIdAndDelete(commentId)
    return res.status(200).json(new ApiResponse(200,{},"comment deleted"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }