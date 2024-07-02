import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const {page=1,limit=10,query="",sortBy="createdAt",sortType=1,userId}=req.query

    if(!userId){
        throw new apiError(400,"UserId is Required")

    }

    // Initialize an empty aggregation pipeline
    const pipeline=[];

    // If userId is provided, add a $match stage to filter by owner
    if(userId){
        await User.findById(userId)
        pipeline.push({
            $match:{
                owner:new mongoose.Types.ObjectId.createFromTime(userId)

            }
        })
    }
    console.log(query,typeof query)

 // If query is provided, add a $match stage to filter unpublished video
    if(query){
        pipeline.push({
            $match:{
                isPublished:false,
            }
        })
    }

    // If sortBy and sortType are provided, add a $sort stage
    let createField=[]
    if(sortBy && sortType){
        createField[sortBy]=sortType==="asc"?1:-1
        pipeline.push({
            $sort:createField

        })
    }
    
    
    // Add $skip stage for pagination
    pipeline.push({
        $skip: (page - 1) * limit
    });

    // Add $limit stage to restrict number of results

    pipeline.push({
        $limit: limit
    });
    console.log(pipeline);

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!(title && description)){
        throw new apiError(400,"User should provide title and description")
    }
    const videourl=req.files?.video[0]?.path;
    const thumbnailurl=req.files?.thumbnailurl[0]?.path

    if(!videourl){
        throw new apiError(400,"video path is required")
    }

    if(!thumbnailurl){
        throw new apiError(400,"thumbnail path is required")

    }

    const video=await uploadOnCloudinary(videourl)
    const thumbnail=await uploadOnCloudinary(thumbnailurl)

    const videoData=await Video.create({
        vedioFile:vedio?.url,
        thumbnail:thumbnail?.url,
        owner:req.user?._id,  
        title:title,
        description:description,
        duration:vedio.duration,
        views:0,
        isPublished : false,
    })
    return res.status(200).json(
    new apiResponse(
        200,
        videoData,
        "video published successfully",

    ))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new apiError(400,"VideoId is required")

    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new apiError(400,"No video Exist with this Id")

    }
    return res.status(200).json(new apiResponse(200,video,"Video returned SuccessFully"))


})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description}=req.body

    if(!videoId){
        throw new apiError(400,"VideoId is required")

    }
    if([title,description].some(fields=>fields.trim()==="")){
        throw new apiError(400,"Tittle and description is required")


    }
    const thumbnailLocalPath=req.file?.path
    if(!thumbnailLocalPath){
        throw new apiError(400,"Thumbnail is requird")

    }
    const updateVideo=await Video.findByIdAndUpdate({
        $set:{
            title,description,thumbnail:thumbnail.url
        }
    },{
        new:true,
    })

    if(!updateVideo){
        throw new apiError(400,"Video was not updated Due to some error")
    }

    return res.status(200).json(
        new apiResponse(200,updateVideo,"Video was Updated SuccessFully")
    )


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
        throw new apiError(500,"VideoId is required")
    }
    const deletedVideo=await Video.findByIdAndDelete(videoId)

    if(!deleteVideo){
        throw new apiError(500,"There was Problem while deleting the video")
    }
    return res.status(200).json(new apiResponse(200,deletedVideo,"Video Deleted SuccessFully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new apiError(400,"VideoId is required")
    }

    const video=await Video.findByIdAndUpdate(videoId,{
        $set:{
            isPublished:!isPublished
        }
    },{
        new:true,
    })

    if(!video){
        throw new apiError(400,"Video status was not updated")
    }
    return res.status(200).json(new apiResponse(200,video,"Video status was Updated"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}