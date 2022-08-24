const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const isAuth = require('../middleware/isAuth');
const postControllers = require('../controllers/post_controller');
const statusControllers = require('../controllers/status_controller');

// POSTS
router.get('/posts', isAuth, postControllers.getPosts);
router.post('/posts', isAuth,
    [ body('title').trim().isLength({min: 5}), 
    body('content').trim().isLength({min: 5})], 
    postControllers.postPosts
);

router.get('/posts/:postId', isAuth, postControllers.getSinglePost);
router.put('/posts/:postId', isAuth,
    [ body('title').trim().isLength({min: 5}), 
    body('content').trim().isLength({min: 5})], 
    postControllers.putEditPost
);

router.delete('/deletePost/:postId', isAuth, postControllers.deletePost);

// STATUS
router.get('/status', isAuth, statusControllers.getStatus);
router.patch('/status', isAuth,
    [ body('newStatus').trim().isLength({min: 3})], 
    statusControllers.patchStatus
);

module.exports = router