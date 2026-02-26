const express = require('express');
const { register, login, getMe, updateDetails, updatePassword } = require('./controller');
const { protect } = require('../../shared/middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;

