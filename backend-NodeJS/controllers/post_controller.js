const { validationResult } = require('express-validator');
const deleteFile = require('../helpers/deleteFile').deleteFile;
const Post = require('../models/post');
const User = require('../models/user');

const getPosts = async (req, res, next) => {
    const currentPage = +req.query.page || 1;
    const ITEMS_PER_PAGE = 2;

    try {
        const totalItems = await Post.find().countDocuments()
        const posts = await Post.find()
            //.populate('creator')
            .skip((currentPage - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)

        res.status(200).json({ posts: posts, totalItems: totalItems});
    } catch(err) {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    }
}

const postPosts = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        console.log(errors)
        const error = new Error('Validation failed. Please enter valid inputs.');
        error.statusCode = 422;
        throw error
    }
    if(!req.file){
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error
    }
    
    const userId = req.user.id;
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace("\\" ,"/");

    const newPost = new Post({title: title, content: content, creator: userId, imageUrl: imageUrl})

    try {
        const postSaved = await newPost.save();
        const user = await User.findById(userId);
        user.posts.push(postSaved._id);
        await user.save()

        res.status(201).json({
            message: 'Post created successfully!',
            post: postSaved,
            creator: {_id: userId, name: req.user.name}
        })
    }  
    catch(err) {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    }
}

const getSinglePost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId) 
    .then(post => {
        if(!post){
            const error = new Error('Post not found.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({post: post})
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    });
}

const putEditPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error = new Error('Validation failed. Please enter valid inputs.');
        error.statusCode = 422
        throw error
    }
    
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl;

    if(req.file){
        imageUrl = req.file.path.replace("\\" ,"/");
    }

    try {
        const post = await Post.findById(postId)
        if(!post) {
            const error = new Error('Post not found to be deleted.');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.user.id.toString()) {
            const error = new Error('You are not authorized to edit this.');
            error.statusCode = 403;
            throw error;
        } 
        if(imageUrl) {
            deleteFile(post.imageUrl);
            post.imageUrl = imageUrl
        }
        post.title = title;
        post.content = content;
        const postSaved = await post.save()
        res.status(200).json({
            message: 'Post edited successfully!',
            post: postSaved
        })
    } catch(err) {
        next(err)
    }
}

const deletePost = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId)
        if(!post){
            const error = new Error('Post not found to be deleted.');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.user.id.toString()) {
            const error = new Error('You are not authorized to delete this.');
            error.statusCode = 403;
            throw error;
        }
        
        const result = await Post.findByIdAndDelete(postId);
        if(result){
            deleteFile(post.imageUrl);
        }

        const user = await User.findById(req.user.id)
        user.posts.pull(postId);
        await user.save()
        res.status(200).json({message: 'Post deleted!'});
    } catch(err) {
        next(err)
    }
}

module.exports = {getPosts, postPosts, getSinglePost, putEditPost, deletePost}