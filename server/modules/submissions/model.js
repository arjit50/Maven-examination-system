const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    exam: {
        type: mongoose.Schema.ObjectId,
        ref: 'Exam',
        required: true
    },
    answers: [
        {
            question: {
                type: mongoose.Schema.ObjectId,
                ref: 'Question'
            },
            selectedOption: String, 
            textAnswer: String 
        }
    ],
    score: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['submitted', 'graded'],
        default: 'submitted'
    },
    submissionType: {
        type: String,
        enum: ['manual', 'auto', 'integrity'],
        default: 'manual'
    },
    warningCount: {
        type: Number,
        default: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Submission', submissionSchema);

