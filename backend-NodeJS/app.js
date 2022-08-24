const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed_route');
const authRoutes = require('./routes/auth_routes');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Math.floor(Math.random() * 16777215).toString(16) + '-' + file.originalname);
    }
});

const fileTypes = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false)
    }
} 

app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter: fileTypes}).single('image'));
app.use(express.static(path.join(__dirname, 'images')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next()
})

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message;
    res.status(statusCode).json({errorMessage: errorMessage})
})

mongoose.connect('MONGODB STRING CONNECTION')
.then(() => {
    app.listen(8080);
}).catch(err => console.log(err));