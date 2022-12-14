const Booking = require("../../models/booking");
const Event = require("../../models/event");

const { user, singleEvent, transformBooking, transformedEvent } = require("./merge");

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticaed!");
    }

    try {
      const bookings = await Booking.find();

      return bookings.map((booking) => {
        return transformBooking(booking);
      });
    } catch (error) {
      throw error;
    }
  },
  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticaed!");
    }

    const fetchedEvent = await Event.findOne({
      _id: args.eventId,
    });
    const booking = new Booking({
      userId: req.userId,
      event: fetchedEvent,
    });
    const result = await booking.save();
    return transformBooking(result);
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticaed!");
    }

    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      const event = transformedEvent(booking.event);

      await Booking.deleteOne({ _id: args.bookingId });

      return event;
    } catch (error) {
      throw error;
    }
  },
};
