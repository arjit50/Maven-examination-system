const express = require('express');
const router = express.Router();
const chatbotController = require('./controller');

router.post('/chat', chatbotController.getChatResponse);

module.exports = router;

