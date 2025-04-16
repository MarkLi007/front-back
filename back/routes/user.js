const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.get('/nickname/:walletAddress', userController.getNickname);
router.post('/nickname', userController.setNickname);

module.exports = router;