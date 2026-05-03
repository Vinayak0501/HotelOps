const express = require('express');
const router = express.Router();

const { getNotifications, markNotificationRead } = require('../controllers/notification.controller');
const { tokenVerificationMiddleware } = require('../middleware/auth.middleware');

router.get('/', tokenVerificationMiddleware, getNotifications);
router.patch('/:id/read', tokenVerificationMiddleware, markNotificationRead);

module.exports = router;
