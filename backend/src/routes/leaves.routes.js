const express = require('express');
const router = express.Router();

const { applyLeave, getMyLeaves, getPendingLeaves, updateLeaveStatus } = require('../controllers/leave.controller');

const { tokenVerificationMiddleware } = require('../middleware/auth.middleware');


router.post('/apply', tokenVerificationMiddleware, applyLeave);
router.get('/my-leaves', tokenVerificationMiddleware, getMyLeaves);
router.get('/pending', tokenVerificationMiddleware, getPendingLeaves);
router.patch('/:id', tokenVerificationMiddleware, updateLeaveStatus);

module.exports = router;