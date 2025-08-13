const path = require('path')
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');

//Route File 
const bootcamps = require('./routes/bootcamp');
const courses = require('./routes/courses');

// Load env vars
dotenv.config({path: './config/config.env'});

//connect to database
connectDB();


const app = express();

//Body parser 
app.use(express.json());

// Dev Logging Middleware 
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')); 
}

// File upload 
app.use(fileupload());

//set static folder
app.use(express.static(path.join(__dirname,'public')));

// Mount routers
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);

app.use(errorHandler)

const PORT = process.env.PORT || 8000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode o port ${PORT}`.yellow.bold)
);

//Handle undandled rejections 
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error : ${err.message}`.red);
    server.close(()=>process.exit(1));
});