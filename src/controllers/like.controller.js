import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)) throw new ApiError(400,"invalid id");
    const likedVideo=await Like.find({
        video: videoId,
        likedBy: req.user?._id,
    })
    if(likedVideo && likedVideo.length>0) {
       await Like.findByIdAndDelete(
         likedVideo
       ,{new: true})
       return res.status(200).json(new ApiResponse(200,{},"Like removed"));
    }
    const newLike=await Like.create({
        video: videoId,
        likedBy: req.user?._id,
    })
    return res.status(200).json(new ApiResponse(200,newLike,"Like added"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)) throw new ApiError(400,"invalid comCommentid");
    const likedComment=await Like.find({
        comment: commentId,
        likedBy: req.user?._id,
    })
    if(likedComment && likedComment.length>0) {
       await Like.findByIdAndDelete(likedComment,{new: true});
       return res.status(200).json(new ApiResponse(200,{},"Like removed"));
    }
    const newLike=await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
    })
    return res.status(200).json(new ApiResponse(200,newLike,"Like added"));
    
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)) throw new ApiError(400,"invalid comCommentid");
    const likedTweet=await Like.find({
        tweet: tweetId,
        likedBy: req.user?._id,
    })
    if(likedTweet && likedTweet.length>0) {
       await Like.findByIdAndDelete(likedTweet,{new: true});
       return res.status(200).json(new ApiResponse(200,{},"Like removed"));
    }
    const newLike=await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    })
    return res.status(200).json(new ApiResponse(200,newLike,"Like added"));
    
   }
)

const getLikedVideos = asyncHandler(async (req, res) => {
   // const {likedBy}=req.body;
  const allVideos= await Like.findById({
        likedBy:req.user?._id,
       video: {$ne:null}  }).populate("video")
    
  if(allVideos.length===0){
     return res.status(200).json(new ApiResponse(200,{},"You haven't liked any videos"))
  }
  return res.status(200).json(new ApiResponse(200,allVideos,"Here are your liked videos"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}