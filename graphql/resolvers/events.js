const Event = require("../../models/event");

const { transformedEvent } = require("./merge");

module.exports = {
  events: async () => {
    try {
      const events = await Event.find().populate("creator");
      return events.map((event) => {
        return transformedEvent(event); //return { ...event._doc, _id: event._doc._id.toString() };
      });
    } catch (err) {
      throw err;
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

      createdEvent = transformedEvent(result);

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
};
