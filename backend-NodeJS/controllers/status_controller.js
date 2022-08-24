const User = require('../models/user');
const {validationResult} = require('express-validator');

const getStatus = async (req, res, next) => {
    const userId = req.user.id;
    
    try {
        const user = await User.findById(userId)

        if(!user){
            const error = new Error('User not found.')
            error.statusCode = 404;
            throw error
        }
        res.status(200).json({status: user.status})
    } catch(err) {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    }
}

const patchStatus = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed.')
        error.statusCode = 422;
        throw error
    }

    try {
        const newStatus = req.body.newStatus;
        const userId = req.user.id;
        const user = await User.findById(userId)
        if(!user){
            const error = new Error('User not found.')
            error.statusCode = 404;
            throw error
        }
        user.status = newStatus;
        await user.save()
        
        res.status(200).json({message: 'Status Updated!'})
    } catch(err) {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    }
}

module.exports = {getStatus, patchStatus}