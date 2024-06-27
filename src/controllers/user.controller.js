import { upload } from "../middleware/multer.middleware.js";
import { User } from "../models/user.modal.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

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
       const {fullName,email,username,password}=req.body;
       console.log(email)

      if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
      ) {
        throw new apiError(400,"All fields are required");

      }
      const ExistedUser=await User.findOne({
        $or:[{username},{email}]
      })

      if(ExistedUser){
        throw new apiError(409,"User with Email or username already Exist");

      }
      const avatarLocalPath=req.files?.avatar[0]?.path;
      req.files?.coverImageLocalPath=req.files?.coverImage[0]?.path;

      if(!avatarLocalPath){
        throw new apiError(400,"Avatar file is required");
      }
      const avatar=await uploadOnCloudinary(avatarLocalPath)
      const coverImage=await uploadOnCloudinary(coverImageLocalPath)

      if(!avatar){
        throw new apiError(400,"Avatar file is required");
      }

      const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()

      })
      const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
      )

      if(!createdUser){
        throw new apiError(500,"Something went Wrong while registering the user")
    }
    return res.status(201).json(
        new apiResponse(200,createdUser,"User registerd Successfully")

    )



})
export {registerUser}
