const express = require('express');
const router = express.Router();

const { createRoom, getRooms, updateRoom } = require('../controllers/room.controller');

const { tokenVerificationMiddleware } = require('../middleware/auth.middleware');

const { allowRoles } = require('../middleware/role.middleware');

// admin only
router.post('/', tokenVerificationMiddleware, allowRoles('admin'), createRoom);

// any logged-in user
router.get('/', tokenVerificationMiddleware, getRooms);

// admin only
router.patch('/:id', tokenVerificationMiddleware, allowRoles('admin'), updateRoom);

module.exports = router;