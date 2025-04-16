const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposal');

router.post('/api/proposals', proposalController.createProposal);
router.post('/api/proposals/:proposalId/vote', proposalController.voteOnProposal);
router.post('/api/proposals/:proposalId/execute', proposalController.executeProposal);

module.exports = router;