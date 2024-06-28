
import { User } from "../models/user.modal.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken=async(userId)=>{
       try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshtoken=user.generateRefreshToken()
        user.refreshtoken=refreshtoken
        await user.save({validateBeforeSave:false})
        
        return {accessToken,refreshtoken}

       } catch (error) {
        throw new apiError(500,"Something went wrong while generating refresh token and access token")
       }
} 
const registerUser=asyncHandler(async(req,res)=>{
       //get user details from frontend
       //validation-not empty
       //check if user already exist:username,email
       //check for images,check for avatar
       //upload to cloudinary
       //create user object
       //remove password and refresh token field from response 
       //check for user creation
       //return res
      const {email,password,fullName,username}=req.body;

      if(
        [fullName,email,password,username].some((field)=>field?.trim()==="")

      ){
        throw new apiError(400,"All the fields are required")
      }

      const existedUser=await User.findOne(
        {
            $or:[{username},{email}]
        }
      )
      if(existedUser){
        throw new apiError(409,"User with email or username already exists");

      }
      const avatarLocalPath=req.files?.avatar[0]?.path;
      let coverImageLocalPath;

       if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath=req.files.coverImage[0].path
       }

       if(!avatarLocalPath){
        throw new apiError(400,"Avatar file is required")
       }

       const avatar=await uploadOnCloudinary(avatarLocalPath)
       const coverImage=await uploadOnCloudinary(coverImageLocalPath)

       if(!avatar){
        throw new apiError(400,"Avatar is Required")
       }

       const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
       })

       const createUser=await User.findById(user._id).select(
        "-password -refreshtoken"
       )

       if(!createUser){
        throw new apiError(500, "Something went wrong while registering the user")
       }

       return res.status(201).json(
        new apiResponse(200, createUser, "User registered Successfully")
    )

})

const loginUser=asyncHandler(async(req,res)=>{
     // req.body -> data
     // username or email
     // find the user
     // password check
     //access and refresh token
     // send cookies
     //res
     const {email,password,username}=req.body

     if(!username || !email){
        throw new apiError(400,'Email or Username is required')
     }

     const user=await User.findOne({
        $or:[{username},{email}]

     })

     if(!user){
        throw new apiError(400,"User does not Exist")

     }
     const isPasswordValid=await user.isPasswordCorrect(password)
     
     if(!isPasswordValid){
        throw new apiError(401,"Invalid Credentials")

     }

     const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id).select(
        "-password -refreshToken"
     )

     const options={
        httpOnly:true,
        secure:true,

     }
     return res.status(200).cookie("accesstoken",accessToken,options).cookie("refreshtoken",refreshToken,options).json(
        new apiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User Logged In Successfully"
        )
     )
})

const logoutUser=asyncHandler(async(req,res)=>{
        User.findByIdAndUpdate(
           req.user._id,
           {
             $set:{  //update 
                refreshToken:undefined
             }
           } ,
           {
            new:true,
           }
        )

        
     const options={
        httpOnly:true,
        secure:true,

     }
     return res.status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshtoken",options)
     .json(new apiResponse(200,{},"User Logged out "))

})

const refreshAccessToken=asyncHandler(async(req,res)=>{
   const incomingRefreshToken=await req.cookies.refreshToken || req.body.refreshToken

   if(incomingRefreshToken){
    throw new apiError(401,"Unauthorized Request")

   }

  try {
     const decodedToken=jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
     )
  
    const user=await User.findById(decodedToken?._id)
  
    if(!user){
      throw new apiError(401,"Invalid refresh Token")
  
    }
    if(incomingRefreshToken!==user?.refreshToken){
      throw new apiError(401,"Refresh token is expired or Used")
    }
    const options={
      httpOnly:true,
      secure:true,
    }
    const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
      new apiResponse(
         200,
         {accessToken,refreshToken:newRefreshToken},
         "Access token refreshed"
         
  
      )
    )
  } catch (error) {
          throw new apiError(401,error?.message || "Invalid refresh token")    
    
  }
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
}

