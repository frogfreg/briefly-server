const { gql } = require("apollo-server");

const typeDefs = gql`
  type Brief {
    briefId: ID!
    text: String!
    images: [String!]!
    author: String!
    comments: [String!]!
    dateCreated: String!
    dateUpdated: String!
  }
  type User {
    username: String!
    email: String!
    picture: String
    userId: ID!
  }
  type Query {
    briefs: [Brief!]!
    users: [User!]!
  }
  type Mutation {
    newBrief(text: String!, images: [String!]): Brief!
    signUp(
      username: String!
      email: String!
      picture: String
      birthdate: String
      showAge: Boolean
      password: String!
    ): String!
  }
`;

module.exports = typeDefs;
