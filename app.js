const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

const app = express();

const events = [];

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
      type Event {
        _id:ID!
        title:String!
        description:String!
        price:Float!
        date: String!
      }

      type User {
        _id:ID!
        email:String!
        password:String
      }

      input EventInput {
        title:String!
        description:String!
        price:Float!
        date:String!
      }

      input UserInput {
        email:String!
        password:String!
      }

      type RootQuery {
          events:[Event!]!
      }

      type RootMutation {
          createEvent(eventInput:EventInput):Event
          createUser(userInput: UserInput):User
      }

      schema{
          query: RootQuery
          mutation: RootMutation
      }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then((events) => {
            return events.map((event) => {
              return { ...event._doc }; //return { ...event._doc, _id: event._doc._id.toString() };
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
            createdEvent = { ...result._doc };
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
    },
    graphiql: true,
  })
);

mongoose
  .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.gitwf.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
  .then(() => {
    console.log("here");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
