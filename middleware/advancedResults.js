const advancedResults = (model,populate) => async(req,res,next) =>{
  let query;

   const reqQuery = {...req.query};
   
   const parsedQuery = qs.parse(reqQuery);

   // Fields to exclude
   const removeFields = ['select','sort','page','limit'];
   
   // Loop over to remove Fields and delete them from reqQuery
   removeFields.forEach(param => delete parsedQuery[param]);

   console.log(reqQuery);

   let queryStr = JSON.stringify(parsedQuery);
   // create operators like gt, gte , etc 
   queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);

   
   query=model.find(JSON.parse(queryStr));

   //Select Fields
   if(req.query.select){
    console.log('came inside select If condition');
     const fields = req.query.select.split(',').join(' ');
     query = query.select(fields);
     console.log(fields);
   }

   console.log(`query ${query}`);

   if(req.query.sort){
     const sortBy = req.query.sort.split(',').join(' ');
     query = query.select(fields);
     query = query.sort(sortBy);
   }else{
     query = query.sort('-createdAt');
   }

   //Pagination
   const page = parseInt(req.query.page,10) || 1;
   const limit = parseInt(req.query.limit,10) || 25;
   const startIndex = (page-1) * limit;
   const endIndex = page*limit;
   const total = await model.countDocuments();

   query = query.skip(startIndex).limit(limit);

   if(populate){
     query = query.populate(populate);
   }

   //executing the query
   const results = await query; 

   //Pagination results 
   const pagination = {};

   if(endIndex < total){
    pagination.next= {
      page:page+1,
      limit
    }
   }

   if(startIndex > 0){
    pagination.prev = {
      page:page-1,
      limit
    }
   }

   res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
   };
   next();
};

module.exports = advancedResults;