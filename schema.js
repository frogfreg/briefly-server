const { gql } = require("apollo-server");

const typeDefs = gql`
  type Brief {
    briefId: ID!
    text: String!
    images: [String!]!
    author: User!
    childBriefs: [Brief!]!
    parentBrief: Brief
    dateCreated: String!
    dateModified: String!
    favoriteOf: [User!]!
    favoriteCount: Int!
    deleted: Boolean!
  }
  type User {
    username: String!
    email: String!
    picture: String
    userId: ID!
    briefs: [Brief!]!
    signupDate: String!
    favorites: [Brief!]!
  }
  type Query {
    briefs: [Brief!]!
    brief(id: ID!): Brief!
    users: [User!]!
    user(id: ID!): User!
    loggedInUser: User!
  }
  type Mutation {
    newBrief(text: String!, images: [String!], parent: ID): Brief!
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
    toggleFavorite(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
