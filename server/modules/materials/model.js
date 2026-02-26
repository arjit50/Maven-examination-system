const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: String,
    subject: {
        type: String,
        required: [true, 'Please add a subject']
    },
    contentUrl: {
        type: String,
        required: [true, 'Please add a content URL or file link']
    },
    type: {
        type: String,
        enum: ['pdf', 'video', 'link', 'doc'],
        default: 'link'
    },
    teacher: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Material', materialSchema);

