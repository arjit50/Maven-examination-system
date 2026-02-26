const express = require('express');
const { submitExam, getMySubmissions, getExamSubmissions } = require('./controller');
const { protect, authorize } = require('../../shared/middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('student'), submitExam);
router.get('/my', authorize('student'), getMySubmissions);
router.get('/exam/:examId', authorize('teacher', 'admin'), getExamSubmissions);

module.exports = router;

