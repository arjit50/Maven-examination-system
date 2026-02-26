const express = require('express');
const { createMaterial, getMaterials, deleteMaterial, uploadMaterialFile } = require('./controller');
const { protect, authorize } = require('../../shared/middleware/auth');
const upload = require('../../shared/middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/', authorize('teacher', 'admin'), createMaterial);
router.get('/', getMaterials);
router.delete('/:id', authorize('teacher', 'admin'), deleteMaterial);
router.post('/upload', authorize('teacher', 'admin'), upload.single('file'), uploadMaterialFile);

module.exports = router;

