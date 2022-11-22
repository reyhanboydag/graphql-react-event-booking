const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.map((event) => {
      return { ...event._doc, date: new Date(event._doc.date), creator: user.bind(this, event.creator) };
    });
  } catch (err) {
    throw err;
  }
};

const singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return { ...event._doc, creator: user.bind(this, event.creator) };
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

module.exports = {
  events: async () => {
    try {
      const events = await Event.find().populate("creator");
      events.map((event) => {
        return {
          ...event._doc,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator),
        }; //return { ...event._doc, _id: event._doc._id.toString() };
      });
      return events;
    } catch (err) {
      throw err;
    }
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find();

      return bookings.map((booking) => {
        return {
          ...booking._doc,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString(),
        };
      });
    } catch (error) {
      throw error;
    }
  },
  createEvent: async (args) => {
    // const event = {
    //   _id: Math.random().toString(),
    //   title: args.eventInput.title,
    //   description: args.eventInput.description,
    //   price: +args.eventInput.price,
    //   date: args.eventInput.date,
    // };
    // events.push(event);

    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "637b66f8bbab3d2678a00ff9",
    });

    let createdEvent;

    try {
      const result = await event.save();

      createdEvent = {
        ...result._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator),
      };

      const creator = await User.findById("637b66f8bbab3d2678a00ff9");

      if (!creator) {
        throw new Error("User not found.");
      }
      creator.createdEvents.push(event);
      await creator.save();

      return createdEvent;
    } catch (error) {
      console.log(err);
    }
  },
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error("User exists already.");
      }

      const hassedPassword = await bcrypt.hash(args.userInput.password, 12);

      const user = new User({
        email: args.userInput.email,
        password: hassedPassword,
      });

      const result = await user.save();

      return { ...result._doc };
    } catch (error) {
      throw error;
    }
  },
  bookEvent: async (args) => {
    const fetchedEvent = await Event.findOne({
      _id: args.eventId,
    });
    const booking = new Booking({
      userId: "637b66f8bbab3d2678a00ff9",
      event: fetchedEvent,
    });
    const result = await booking.save();
    return {
      ...result._doc,
      id: result.id,
      user: user.bind(this, booking._doc.user),
      event: singleEvent.bind(this, booking._doc.event),
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString(),
    };
  },
  cancelBooking: async (args) => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      const event = { ...booking.event._doc, creator: user.bind(this, booking.event._doc.creator) };

      await Booking.deleteOne({ _id: args.bookingId });

      return event;
    } catch (error) {
      throw error;
    }
  },
};
