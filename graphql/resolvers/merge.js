const Event = require("../../models/event");
const User = require("../../models/user");

const { dateToString } = require("../../helpers/date");

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.map((event) => {
      return transformedEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

const singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return transformedEvent(event);
  } catch (error) {}
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return { ...user._doc, createdEvents: events.bind(this, user._doc.createdEvents) };
  } catch (err) {
    throw err;
  }
};

const transformedEvent = (event) => {
  return {
    ...event._doc,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event._doc.creator),
  };
};

const transformBooking = (booking) => {
  return {
    ...booking._doc,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt),
  };
};

exports.user = user;
exports.singleEvent = singleEvent;
exports.events = events;
exports.transformedEvent = transformedEvent;
exports.transformBooking = transformBooking;
