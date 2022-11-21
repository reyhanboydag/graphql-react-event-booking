const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");

const events = (eventIds) => {
  return Event.find({ _id: { $in: eventIds } })
    .then((events) => {
      return events.map((event) => {
        return { ...event._doc, date: new Date(event._doc.date), creator: user.bind(this, event.creator) };
      });
    })
    .catch((err) => {
      throw err;
    });
};

const user = (userId) => {
  return User.findById(userId)
    .then((user) => {
      return { ...user._doc, createdEvents: events.bind(this, user._doc.createdEvents) };
    })
    .catch((err) => {
      throw err;
    });
};

module.exports = {
  events: () => {
    return Event.find()
      .populate("creator")
      .then((events) => {
        return events.map((event) => {
          return {
            ...event._doc,
            date: new Date(event._doc.date).toISOString(),
            creator: user.bind(this, event._doc.creator),
          }; //return { ...event._doc, _id: event._doc._id.toString() };
        });
      })
      .catch((err) => {
        throw err;
      });
  },
  createEvent: (args) => {
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
    return event
      .save()
      .then((result) => {
        createdEvent = {
          ...result._doc,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, result._doc.creator),
        };
        return User.findById("637b66f8bbab3d2678a00ff9");
      })
      .then((user) => {
        if (!user) {
          throw new Error("User not found.");
        }
        user.createdEvents.push(event);
        return user.save();
      })
      .then((result) => {
        return createdEvent;
      })
      .catch((err) => console.log(err));
  },
  createUser: (args) => {
    return User.findOne({ email: args.userInput.email })
      .then((user) => {
        if (user) {
          throw new Error("User exists already.");
        }
        return bcrypt.hash(args.userInput.password, 12);
      })
      .then((hassedPassword) => {
        const user = new User({
          email: args.userInput.email,
          password: hassedPassword,
        });
        return user.save();
      })
      .then((result) => {
        return { ...result._doc };
      })
      .catch((err) => {
        throw err;
      });
  },
};
