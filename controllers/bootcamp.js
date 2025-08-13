const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geoCoder = require('../utils/geocoder');
const path = require('path');
const qs = require('qs');

// @desc Get all bootcamps 
// @route GET /api/v1/bootcamps
// @access Public  
exports.getBootcamps = asyncHandler(async (req,res,next)=>{
   
    res
      .status(200)
      .json(res.advancedResults);
});  

// @desc Get Single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public  
exports.getBootcamp = asyncHandler(async (req,res,next)=>{
     try{
       const bootcamp = await Bootcamp.findById(req.params.id);
       if(!bootcamp){
         return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
       }
       res.status(200).json({success:true,data:bootcamp});
     }catch(err){
       next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404)
    );
}
});

// @desc Create new bootcamp
// @route POST /api/v1/bootcamps/
// @access Private  
exports.createBootcamp = asyncHandler(async (req,res,next)=>{
    try{
        const bootcamp = await Bootcamp.create(req.body);

        res.status(201).json({
            success:true,
            data:bootcamp});
    } catch(err){
       next(err);
    }       
});

// @desc Update bootcamp
// @route POST /api/v1/bootcamps/:id
// @access Private  
exports.updateBootcamp = asyncHandler(async (req,res,next)=>{
    try{
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
             new:true,
            runValidators:true
            });

        if(!bootcamp){
              return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }
   }catch(err){
     next(err);
   }
});

// @desc Delete bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private  
exports.deleteBootcamp = asyncHandler(async (req,res,next)=>{
    try{
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
           return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }
      await bootcamp.deleteOne();
      return res.status(200).json({success:true,data:{}});    
    }catch(err){
      next(err);
    }
});


// @desc Get bootcamp within a radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance/
// @access Private  
exports.getBootcampsInRadius = asyncHandler(async (req,res,next)=>{
  const { zipcode, distance} = req.params;

  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //cal radius using radians 
  //divide distance By radius of earth 
  // Earth radius = 3,963 mi

  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    
     location : {
      $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] }
     }

  });
   res.status(200).json({
     success:true,
     count:bootcamps.length,
     data:bootcamps
   });

});


// @desc Upload phot for  bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private  
exports.bootcampPhotoUpload = asyncHandler(async (req,res,next)=>{
    try{
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
           return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }

       if(!req.files){
         return next(new ErrorResponse(`Please upload a file`,400));
       }  
       
       const file = req.files.file;

       //make sure the image is a photo
       if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse(`Please upload an image file`,400));
       }

       //check filesize
       if(file.size > process.env.MAX_FILE_UPLOAD){
         return next(new ErrorResponse(`Please upload an image file less than ${process.env.MAX_FILE_UPLOAD}`,400));
       }

       // create custom filename
       file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
       file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err=>{
           if(err){
            console.error(err);
            return next(new ErrorResponse(`Problem with File upload `,400));
           }
           await Bootcamp.findByIdAndUpdate(req.params.id,{photo: file.name});
       });
       res.status(200).json({success:true,
        data:file.name
       });

    }catch(err){
      next(err);
    }
});
