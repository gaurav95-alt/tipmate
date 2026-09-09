const SosEvent = require('../models/SosEvent');
const User = require('../models/User');

const triggerSos = async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy, message } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required to trigger an SOS.',
      });
    }

    const event = await SosEvent.create({
      user: req.userId,
      location: { latitude, longitude, accuracy },
      message,
      emergencyContacts: req.user.emergencyContacts || [],
      status: 'triggered',
    });

    // This endpoint records the emergency event. Actual SMS/call/push dispatch
    // can be connected here later through a verified emergency provider.
    return res.status(201).json({
      success: true,
      message: 'SOS alert triggered and location logged.',
      alert: {
        id: event._id,
        status: event.status,
        location: event.location,
        emergencyContacts: event.emergencyContacts,
        createdAt: event.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { triggerSos };
