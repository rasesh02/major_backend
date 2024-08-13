import mongoose,{isValidObjectId} from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js";

const createTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body;
    const userId=req.user?._id;
    if(!content) throw new ApiError(400,"Tweet has no content");
   const userTweet= await Tweet.create({
        owner: userId,
        content: content,
    })
    if(!userTweet) throw new ApiError(500,"Some error occured while uploading tweet");
    return res.status(200).json(new ApiResponse(200,userTweet,"Tweet Created"));
})


const getUserTweets = asyncHandler(async (req, res) => {
    const {userId}=req.params;
    if(!userId) throw new ApiError(400,"User not found");
   const allTweets= await Tweet.find({
        owner: userId,
    })
    if(!allTweets) throw new ApiError(500,"Some error Occured with fetching tweets");
    return res.status(200).json(new ApiResponse(200,allTweets,"User tweets fetched"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId}=req.params;
   const {content}=req.body;
   if(!content) throw new ApiError(400,"Tweet does not contain anything");
  const updatedTweet= await Tweet.findByIdAndUpdate(tweetId,{
    $set: {
        content: content,
    }
   },{new: true});

return res.status(200).json(new ApiResponse(200,updatedTweet,"Tweet updated succcessfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId}=req.params;
    await Tweet.deleteOne({
        _id:tweetId,
    })
    return res.status(200).json(new ApiResponse(200,{},"Tweet deletion successful"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}