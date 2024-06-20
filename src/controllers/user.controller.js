import { asyncHandler } from "../utils/asyncHandler.js";
//methods are created
const registerUser=asyncHandler(async(req,res)=>{
     res.status(200).json({
        message:"hello"
    })
})

export {registerUser};