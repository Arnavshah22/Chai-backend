import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccount, updateAvatar, updateCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router=Router();

router.route("/register").post(
    upload.fields([
        {
          name:"avatar",
          maxCount:1
        },{
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

    router.route("/login").post(loginUser)


    //secured routes
    router.route("/logout").post(verifyJWT,logoutUser)
    router.route("/refresh-token").post(refreshAccessToken)
    router.route("/change-password").post(verifyJWT,changeCurrentPassword)
    router.route("/current-user").get(verifyJWT,getCurrentUser)
    router.route("update-account").patch(verifyJWT,updateAccount)
    router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar)
    router.route("/cover-image").patch(verifyJWT,upload.single("/coverImage"),updateCoverImage)
    router.route("/c/:username").get(verifyJWT,getUserProfile)
    router.route("/history").get(verifyJWT,getWatchHistory)
    

export default router