const db = require("./database/db.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const resolvers = {
  Query: {
    briefs: async (parent, args, context) => {
      if (args.page) {
        console.log("Page was given");
        console.trace();
      }
      try {
        const queryResult = await db.query("SELECT * FROM briefs");
        return queryResult.rows;
      } catch (err) {
        throw new Error(err);
      }
    },
    users: async (parent, args, context) => {
      try {
        const queryResult = await db.query("SELECT * FROM users");
        return queryResult.rows;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    newBrief: async (parent, args, context) => {
      //TODO: check if context is sending correct user, check if user exists, add nested queries, deal with images
      const briefId = uuidv4();
      if (!context.userId) {
        throw new Error("You must be logged in to create a new Brief!");
      }
      try {
        const queryResult = await db.query(
          "INSERT INTO briefs VALUES($1, $2, $3)",
          [briefId, args.text, context.userId]
        );

        if (queryResult.rowCount === 0) {
          throw new Error("The brief was not created");
        }

        const newBriefQuery = await db.query(
          'SELECT * from briefs WHERE "briefId" = $1',
          [briefId]
        );

        return newBriefQuery.rows[0];
      } catch (err) {
        throw new Error(err);
      }
    },
    signUp: async (
      parent,
      {
        username,
        email,
        password,
        picture = null,
        birthdate = null,
        showAge = null,
      }
    ) => {
      //TODO: deal with ages, test user creation, add user edition mutation
      const userId = uuidv4();

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      try {
        const queryResult = await db.query(
          "INSERT INTO users VALUES($1, $2, $3, $4, $5, $6, $7)",
          [userId, username, email, hashedPassword, birthdate, picture, showAge]
        );

        const token = jwt.sign(
          { userId },
          process.env.SECRET_KEY || "thisisasecret"
        );

        return token;
      } catch (err) {
        throw new Error(err.detail);
      }
    },
  },
};

module.exports = resolvers;
