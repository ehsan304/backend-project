import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js"


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend (in this case we use postman)
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloadinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response body (frontend)
    // check for user creation
    //return response




    // get user details from frontend (in this case we use postman)
    const { username, email, password, fullname } = req.body
    console.log("email: ", email);



    // validation - not empty
    if (
        [username, email, password, fullname].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }



    // check if user already exists: username, email
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email and username already existed")
    }



    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required ")
    }

    // upload them to cloadinary, avatar

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required ")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // check for user creation
    const createdUser = await User.findById(user._id).select(
        "/password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // remove password and refresh token field from response
    // already removed in above code with "select" method

    //return response
return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
)






})

export { registerUser }