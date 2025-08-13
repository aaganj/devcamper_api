const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err,req,res,next)=>{

    let error ={...err};
    error.message = err.message;
 // log to console 
   console.log(err);

    //Moongoose bad ObjectID
    if(err.name == 'CastError'){
        const message = `Bootcamp not found with id of ${err.value}`;
        error = new ErrorResponse(message,404);
    }

    //Moongoose Duplicate Key 
    if(err.code === 11000){
        const message = 'duplicate field value entered ';
        error = new ErrorResponse(message,400);
    }

    //Moongoose Validation
    if(err.name == 'ValidationError'){
        const message = Object.values(err.errors).map(val=>val.message);
        error = new ErrorResponse(message,400);
    }

   res.status(error.statusCode || 500).json({
    success:false,
    error:error.message || 'Server Error'
   });
}

module.exports = errorHandler;
