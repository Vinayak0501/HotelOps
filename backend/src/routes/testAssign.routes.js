const express = require('express');
const router = express.Router();

const Task = require('../models/Task');
const { assignTask } = require('../services/assignment.service');

const { runDailyTaskCreation, runAssignmentForHotel } = require('../cron/dailyTasks.cron');

router.get('/run-daily', async (req, res) => {

  try {
    await runDailyTaskCreation();

    res.json({
      message: "Daily tasks created successfully"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }

});

router.get('/assign-all', async (req, res) => {

    const tasks = await Task.find({ status: 'pending' });

    for (let task of tasks) {
        await assignTask(task);
    }

    res.json({ message: "Assignment triggered" });
});

module.exports = router;