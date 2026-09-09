const mongoose = require('mongoose');
const Booking = require('../models/Booking');

const createBooking = async (req, res, next) => {
  try {
    const { provider, externalBookingId, bookingType, destination, amount, currency, commissionRate = 0, paymentGateway, paymentReference, metadata } = req.body;

    if (amount === undefined || Number.isNaN(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({ success: false, message: 'A valid non-negative amount is required.' });
    }
    if (Number.isNaN(Number(commissionRate)) || Number(commissionRate) < 0 || Number(commissionRate) > 100) {
      return res.status(400).json({ success: false, message: 'commissionRate must be between 0 and 100.' });
    }

    const booking = await Booking.create({
      user: req.userId,
      provider,
      externalBookingId,
      bookingType,
      destination,
      amount: Number(amount),
      currency,
      commissionRate: Number(commissionRate),
      commissionAmount: Number(amount) * Number(commissionRate) / 100,
      paymentGateway,
      paymentReference,
      metadata,
      status: 'initiated',
    });

    return res.status(201).json({ success: true, message: 'Booking log created.', booking });
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid booking id.' });
    if (!['initiated', 'confirmed', 'completed', 'cancelled', 'refunded', 'failed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status.' });
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: { status } },
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    return res.json({ success: true, message: 'Booking status updated.', booking });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getBookings, updateBookingStatus };
