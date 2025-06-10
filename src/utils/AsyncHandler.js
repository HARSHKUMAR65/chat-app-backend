const asyncHandler = (fn) => async(req,res,next) =>{
    try{
        await fn(req,res,next)
    } catch (error){
        res.status(error.code || 500).json({
            sucess :false , 
            message : error.message || "Internal server error in api",
            stack : error.stack,
            error : error
            
        })
    }
}

export { asyncHandler}