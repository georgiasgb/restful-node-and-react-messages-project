const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
    //, createdAt: { // automatically created with {timestamps: true} bellow
    //     type: Schema.Types.Date,
    //     required: true
    // }
}, {timestamps: true}); // With this second argument mongoose will automatically add a createdAt and 
// updatedAt timestamps when a new version/object is added to the database.

const postModel = mongoose.model('Post', postSchema);

module.exports = postModel;