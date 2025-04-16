const express = require('express');
const router = express.Router();
const paperController = require('../controllers/paper');

router.get('/api/citations/:paperId', paperController.getCitations);
router.get('/api/influence/:paperId', paperController.getInfluenceScore);
router.put('/api/paper', paperController.updatePaper);

module.exports = router;