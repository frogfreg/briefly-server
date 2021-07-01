const { ApolloServer } = require("apollo-server");

const typeDefs = require("./schema.js");
const resolvers = require("./resolvers.js");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const userId = (req.headers && req.headers.authorization) || "1";
    return { userId };
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
