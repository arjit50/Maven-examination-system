const express = require('express');
const { createExam, getExams, getExam, updateExam, deleteExam } = require('./controller');
const { protect, authorize } = require('../../shared/middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getExams)
    .post(authorize('teacher', 'admin'), createExam);

router.route('/:id')
    .get(getExam)
    .put(authorize('teacher', 'admin'), updateExam)
    .delete(authorize('teacher', 'admin'), deleteExam);

module.exports = router;

