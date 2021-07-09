//TODO: Update deleteBrief mutation to deal with deleted parents

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
        const queryResult = await db.query(`SELECT * FROM users`);
        return queryResult.rows;
      } catch (err) {
        throw new Error(err);
      }
    },
    loggedInUser: async (parent, args, context) => {
      //TODO: extract userId from jwt, validate in db and return user info

      if (!context.userId) {
        throw new Error("You must be logged in to see this info!");
      }

      try {
        const queryResult = await db.query(
          `SELECT * FROM users WHERE "userId" = $1`,
          [context.userId]
        );

        return queryResult.rows[0];
      } catch (err) {
        throw new Error(err);
      }
    },
    brief: async (parent, { id }, context) => {
      try {
        const queryResult = await db.query(
          `SELECT * FROM briefs WHERE "briefId" = $1`,
          [id]
        );

        if (queryResult.rowCount === 0) {
          throw new Error("Brief was not found");
        }

        return queryResult.rows[0];
      } catch (err) {
        throw new Error(err);
      }
    },
    user: async (parent, { id }, context) => {
      try {
        const queryResult = await db.query(
          `SELECT * FROM users WHERE "userId" = $1`,
          [id]
        );

        if (queryResult.rowCount === 0) {
          throw new Error("User was not found");
        }

        return queryResult.rows[0];
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    newBrief: async (parent, args, context) => {
      if (!context.userId) {
        throw new Error("You must be logged in to create a new Brief!");
      }
      const briefId = uuidv4();
      try {
        const queryResult = await db.query(
          "INSERT INTO briefs VALUES($1, $2, $3)",
          [briefId, args.text, context.userId]
        );
        if (args.parent) {
          await db.query("INSERT INTO threads VALUES($1, $2)", [
            args.parent,
            briefId,
          ]);
        }

        if (args.images && args.images.length > 0) {
          try {
            const promises = [];

            args.images.forEach((imageUrl) => {
              const promise = db.query("INSERT INTO images VALUES($1, $2)", [
                briefId,
                imageUrl,
              ]);
              promises.push(promise);
            });

            await Promise.all(promises);
          } catch (err) {
            throw new Error(err);
          }
        }

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
    deleteBrief: async (parent, { id }, context) => {
      try {
        const queryResult = await db.query(
          'DELETE FROM briefs WHERE "briefId" = $1',
          [id]
        );

        if (queryResult.rowCount === 0) {
          return false;
        }

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
    signIn: async (parent, { username, email, password }, context) => {
      if (!username && !email) {
        throw new Error("You must provide email or username to log in!");
      }
      try {
        const userCheckQuery = await db.query(
          `SELECT username, password, "userId" FROM users WHERE username = $1 OR email = $2`,
          [username, email]
        );
        if (userCheckQuery.rowCount === 0) {
          throw new Error("User not found. Check username or email");
        }

        const { password: hashedPassword, userId } = userCheckQuery.rows[0];

        if (bcrypt.compareSync(password, hashedPassword)) {
          const token = jwt.sign(
            { userId },
            process.env.SECRET_KEY || "thisisasecret"
          );

          return token;
        } else {
          throw new Error("Wrong password");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    toggleFavorite: async (parent, { id }, context) => {
      if (!context.userId) {
        throw new Error("You must be logged in to fav a brief");
      }
      try {
        const queryResult = await db.query(
          `SELECT * FROM favorites WHERE "briefId" = $1 AND "userId" = $2`,
          [id, context.userId]
        );

        if (queryResult.rowCount === 0) {
          await db.query("INSERT INTO favorites VALUES($1, $2)", [
            context.userId,
            id,
          ]);
          return true;
        } else {
          await db.query(
            `DELETE FROM favorites WHERE "userId" = $1 AND "briefId" = $2`,
            [context.userId, id]
          );
          return false;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Brief: {
    author: async (parent, args, context) => {
      try {
        const queryResult = await db.query(
          `SELECT * FROM users WHERE "userId" = $1`,
          [parent.authorId]
        );

        return queryResult.rows[0];
      } catch (err) {
        throw new Error(err);
      }
    },
    images: async (parent, args, context) => {
      try {
        const queryResult = await db.query(
          `SELECT "imageUrl" FROM images WHERE "briefId" = $1`,
          [parent.briefId]
        );

        return queryResult.rows.map((row) => {
          return row.imageUrl;
        });
      } catch (err) {
        throw new Error(err);
      }
    },
    favoriteOf: async (parent, args, context) => {
      try {
        const queryResult = await db.query(
          `SELECT users.* FROM favorites JOIN users ON favorites."userId" = users."userId" WHERE favorites."briefId" = $1`,
          [parent.briefId]
        );

        return queryResult.rows;
      } catch (err) {
        throw new Error(err);
      }
    },
    favoriteCount: async (parent, args, context) => {
      try {
        const queryResult = await db.query(
          `SELECT COUNT(*) FROM favorites WHERE "briefId" = $1`,
          [parent.briefId]
        );

        return queryResult.rows[0].count;
      } catch (err) {
        throw new Error(err);
      }
    },
    parentBrief: async (parent, args, context) => {
      try {
        const queryResult = await db.query(
          `SELECT briefs.* FROM threads JOIN briefs ON threads."parentId" = briefs."briefId" WHERE threads."childrenId" = $1`,
          [parent.briefId]
        );

        if (queryResult.rowCount === 0) {
          return null;
        } else {
          return queryResult.rows[0];
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    childBriefs: async (parent, args, context) => {
      try {
        const queryResult = await db.query(
          `SELECT briefs.* FROM threads JOIN briefs ON threads."childrenId" = briefs."briefId" WHERE threads."parentId" = $1`,
          [parent.briefId]
        );

        if (queryResult.rowCount === 0) {
          return [];
        } else {
          return queryResult.rows;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  User: {
    briefs: async (parent, args, context) => {
      try {
        const queryResult = await db.query(
          `SELECT * FROM briefs WHERE "authorId" = $1`,
          [parent.userId]
        );

        return queryResult.rows;
      } catch (err) {
        throw new Error(err);
      }
    },
    favorites: async (parent, args, context) => {
      try {
        const queryResult = await db.query(
          `SELECT briefs.* FROM briefs JOIN favorites ON favorites."briefId" = briefs."briefId" WHERE favorites."userId" = $1`,
          [parent.userId]
        );

        return queryResult.rows;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

module.exports = resolvers;
