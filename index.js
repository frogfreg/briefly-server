const { ApolloServer } = require("apollo-server");
const jwt = require("jsonwebtoken");

const typeDefs = require("./schema.js");
const resolvers = require("./resolvers.js");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    let token = {};
    if (req.headers && req.headers.authorization) {
      try {
        const regex = /bearer\s+/i;

        token = jwt.verify(
          req.headers.authorization.replace(regex, ""),
          process.env.SECRET_KEY || "thisisasecret"
        );
      } catch (err) {
        throw new Error(err);
      }
    } else {
      token.userId = "1";
    }

    return { userId: token.userId };
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
