const db = require("./database/db.js");

const resolvers = {
  Query:{
    briefs: async () => {
      const queryResult = await db.query("SELECT * FROM briefs");
      return queryResult.rows;
    }
  }
};

module.exports = resolvers;