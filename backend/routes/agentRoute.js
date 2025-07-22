const express = require('express');
const router = express.Router();
const {
  agentLogin,
  verifyAgent,
  getAgentInfo
} = require('../controllers/agentController');

// Agent login
router.post('/login', agentLogin);

// Get agent info (protected route)
router.get('/info', verifyAgent, getAgentInfo);

module.exports = router;
