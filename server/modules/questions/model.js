const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    exam: {
        type: mongoose.Schema.ObjectId,
        ref: 'Exam',
        required: true
    },
    text: {
        type: String,
        required: [true, 'Please add question text']
    },
    type: {
        type: String,
        enum: ['mcq', 'tf', 'text'],
        default: 'mcq'
    },
    options: [
        {
            text: String,
            isCorrect: Boolean
        }
    ],
    marks: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Question', questionSchema);

