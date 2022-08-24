const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authControllers = require('../controllers/auth_controller');

router.post('/signup',
    [body('email').trim().isEmail().normalizeEmail(), 
    body('name').trim().isString().isLength({min: 3}),
    body('password').trim().isLength({min: 8})],
    authControllers.postSignup
);

router.post('/login', 
    [body('email').trim().isEmail().normalizeEmail(),
    body('password').trim().isLength({min: 8})], 
    authControllers.postLogin
);

module.exports = router