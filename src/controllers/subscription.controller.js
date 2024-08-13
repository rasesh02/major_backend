import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!isValidObjectId(channelId)) throw new ApiError(404,"This channel does not exists");
    const subscribed= await Subscription.find({
        channel: channelId,
        subscriber: req.user?._id,
    })
    if(subscribed.length>0) {
        await Subscription.findByIdAndDelete(subscribed,{new: true});
    }
    const newSub= await Subscription.create({
        channel: channelId,
        subscriber: req.user?._id,
    })
    return res.status(200).json(new ApiResponse(200,newSub,"Subscribed Successfully"));
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!isValidObjectId(channelId)) throw new ApiError(404,"Invalid channel");
    const arr=await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(`${req.user?._id}`),
            }
        },
        {
            $project: {
                channel: 1,
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,arr,"All Subscribers fetched"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if(!isValidObjectId(subscriberId)) throw new ApiError(404,"Invalid channel");
    const arr=await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(`${req.user?._id}`),
            }
        },
        {
            $project: {
                subscriber: 1,
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,arr,"All Channels fetched"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}