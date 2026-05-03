const Notification = require('../models/Notification');

function buildNotificationFilter(user) {
  const baseFilter = {
    hotelId: user.hotelId,
    isRead: false,
  };

  if (user.role === 'admin') {
    return {
      ...baseFilter,
      $or: [
        { recipientRole: 'admin' },
        { recipientRole: 'all' },
        { recipientRole: { $exists: false } },
      ],
    };
  }

  return {
    ...baseFilter,
    $or: [
      { recipientRole: 'all' },
      { recipientUserId: user.id },
      {
        recipientRole: 'staff',
        recipientUserId: { $exists: false },
      },
      {
        recipientRole: 'staff',
        recipientUserId: null,
      },
    ],
  };
}

async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find(buildNotificationFilter(req.user))
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
}

async function markNotificationRead(req, res) {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        ...buildNotificationFilter(req.user),
      },
      {
        $set: { isRead: true },
      },
      { returnDocument: 'after' }
    );

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
      });
    }

    res.json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
}

module.exports = { getNotifications, markNotificationRead };
