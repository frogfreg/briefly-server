// TODO: Add support for favorites
const { gql } = require("apollo-server");

const typeDefs = gql`
  type Brief {
    briefId: ID!
    text: String!
    images: [String!]!
    author: User!
    childBriefs: [String!]!
    parentBrief: Brief
    dateCreated: String!
    dateUpdated: String!
  }
  type User {
    username: String!
    email: String!
    picture: String
    userId: ID!
    briefs: [Brief!]!
    signupDate: String!
  }
  type Query {
    briefs: [Brief!]!
    brief(id: ID!): Brief!
    users: [User!]!
    user(id: ID!): User!
    loggedInUser: User!
  }
  type Mutation {
    newBrief(text: String!, images: [String!]): Brief!
    deleteBrief(id: ID!): Boolean!
    signUp(
      username: String!
      email: String!
      picture: String
      birthdate: String
      showAge: Boolean
      password: String!
    ): String!
    signIn(username: String, email: String, password: String!): String!
  }
`;

module.exports = typeDefs;
