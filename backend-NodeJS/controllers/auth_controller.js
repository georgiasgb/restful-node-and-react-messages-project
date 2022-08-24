const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const postSignup = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    const error = new Error('User creation failed. Please enter valid inputs.');
    error.statusCode = 422;
    throw error
  }

  try {
    const name = req.body.name; 
    const email = req.body.email;
    const password = req.body.password;    

    const userExists = await User.findOne({email: email})
    if (userExists) {
      return res.status(422).json({errorMessage: 'Email already has an account.'})
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const newUser = new User({name, email, password: hashedPassword});
    await newUser.save()
    
    res.status(201).json({message: 'User created successfully!'})
  } catch(err)  {
    if(!err.statusCode){
      err.statusCode = 500
    }
    next(err)    
  }
}

const postLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    const error = new Error('Email or password is not correct.');
    error.statusCode = 422;
    throw error
  }

  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({email: email});
    if (!user) {
      const error = new Error('Email does not have an account.');
      error.statusCode = 404;
      throw error
    }

    const matchPassword = await bcrypt.compare(password, user.password)
    if (!matchPassword) {
      const error = new Error('Invalid password.');
      error.statusCode = 401;
      throw error
    };

    const token = jwt.sign({email: user.email, userId: user._id.toString(), name: user.name}, 
    'a1D2g3J4zzz', {expiresIn: '1h'});
      
    res.status(200).json({userId: user._id.toString(), token: token})

  } catch (err) {
    if(!err.statusCode){
      err.statusCode = 500
    }
    next(err)
  }    
}

module.exports = { postSignup, postLogin }