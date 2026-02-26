const express = require('express');
const { addQuestion, deleteQuestion, updateQuestion } = require('./controller');
const { protect, authorize } = require('../../shared/middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('teacher', 'admin'));

router.post('/', addQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;

