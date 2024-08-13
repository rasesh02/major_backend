import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"



//
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description,video,owner} = req.body
    if([name,description].some((field)=>field?.trim==="")) throw new ApiError(400,"Playlist Credentials incomplete");
    if(!isValidObjectId(owner)) throw new ApiError(400,"Invalid user")
    const createdPlaylist=await Playlist.create({
        name,
        description,
        video,
        owner,
    })
    if(!createPlaylist) throw new ApiError(500,"Server error while creating playlist")
    return res.status(200).json(new ApiResponse(200,createdPlaylist,"Playlist is created"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    if(!isValidObjectId(userId)) throw new ApiError(400,"Wrong user id");
   const allUserPlaylists= await Playlist.find({
        owner: userId,
    })
    return res.status(200).json(new ApiResponse(200,allUserPlaylists,"user playlists fetched"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)) throw new ApiError(400,"Invalid playlist id")
    const playlists=await Playlist.findById(playlistId);
    return res.status(200).json(new ApiResponse(200,playlists,"Playlists fetched"));
})
//
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400,"Invalid playlist or video id")
    const addedVideo=await Playlist.findById(playlistId,
         {
            $push: {
                video:videoId
            }
        },{new: true}) 
    if(!addedVideo) throw new ApiError(404,"Playlist not found");
    return res.status(200).json(new ApiResponse(200,addedVideo,"Video added"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400,"Invalid playlist or video id")
        const removedVideo=await Playlist.findById(playlistId,
             {
                $pull: {
                    video:videoId
                }
            },{new: true}) 
        if(!addedVideo) throw new ApiError(404,"Playlist not found");
        return res.status(200).json(new ApiResponse(200,removedVideo,"Video removed"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res.status(200)
    .json(new ApiResponse(200, {}, "Playlist Deleted Successfully"))
})
//
const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    const updatedPlaylist=await Playlist.findByIdAndUpdate(playlistId,{
       $set:{
        name: name,
        description: description
       } 
    },{new:true})
    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Playlist is updated"))
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