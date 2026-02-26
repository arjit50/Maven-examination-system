const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: String,
    subject: {
        type: String,
        required: [true, 'Please add a subject']
    },
    teacher: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    duration: {
        type: Number, 
        required: [true, 'Please add duration in minutes']
    },
    questions: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Question'
        }
    ],
    totalMarks: {
        type: Number,
        default: 0
    },
    passingMarks: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Exam', examSchema);

