const jwt = require('jsonwebtoken');

// Simple agent credentials (in production, this should be in database with hashed passwords)
const AGENT_CREDENTIALS = {
  username: 'admin',
  password: 'agent123',
  name: 'Credit Repair Agent'
};

// Agent login
const agentLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username !== AGENT_CREDENTIALS.username || password !== AGENT_CREDENTIALS.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Create JWT token for agent
    const token = jwt.sign(
      { 
        type: 'agent',
        username: AGENT_CREDENTIALS.username,
        name: AGENT_CREDENTIALS.name
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      agent: {
        username: AGENT_CREDENTIALS.username,
        name: AGENT_CREDENTIALS.name
      }
    });
  } catch (error) {
    console.error('Error during agent login:', error);
    res.status(500).json({
      success: false,
      message: 'Login error'
    });
  }
};

// Verify agent token middleware
const verifyAgent = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    if (decoded.type !== 'agent') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }
    
    req.agent = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Get agent info
const getAgentInfo = async (req, res) => {
  res.json({
    success: true,
    agent: {
      username: req.agent.username,
      name: req.agent.name
    }
  });
};

module.exports = {
  agentLogin,
  verifyAgent,
  getAgentInfo
};
