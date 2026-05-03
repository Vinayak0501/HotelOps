process.env.TZ = 'Asia/Kolkata';
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const connectDB = require('./src/config/db');
const { startCronJobs } = require('./src/cron');
const authRoutes = require('./src/routes/auth.routes');
const testRoutes = require('./src/routes/test.routes');
const roomRoutes = require('./src/routes/room.routes');
const attendanceRoutes = require('./src/routes/attendance.routes');
const taskRoutes = require('./src/routes/task.routes');
const hotelRoutes = require('./src/routes/hotel.routes');
const testAssignRoutes = require('./src/routes/testAssign.routes');
const leaveRoutes = require('./src/routes/leaves.routes');
const adminRoutes = require('./src/routes/admin.routes');
const notificationRoutes = require('./src/routes/notification.routes');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/testAssign', testAssignRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', function(req, res) {
  console.log('Root route hit');
  res.json({
    message: 'Server started...',
  });
});

async function startServer() {
  await connectDB();
  startCronJobs();

  app.listen(PORT, function() {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
