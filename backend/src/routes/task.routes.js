const express = require('express');
const router = express.Router();
const { myTasks, startTask, completeTask } = require('../controllers/task.controller');

const { tokenVerificationMiddleware } = require('../middleware/auth.middleware');

router.post('/:id/start', tokenVerificationMiddleware, startTask);
router.post('/:id/complete', tokenVerificationMiddleware, completeTask);
router.get('/my-tasks', tokenVerificationMiddleware, myTasks);

module.exports = router;
