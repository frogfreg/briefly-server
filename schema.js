const {gql} = require("apollo-server");

const typeDefs = gql`
  type Brief{
    text: String!
    author: String!
    comments: [String!]!
    dateCreated: String!
    dateUpdated: String!
  }
  type User{
    username: String!
    email: String!
  }
  type Query{
    briefs: [Brief!]!
  }
`

module.exports = typeDefs;