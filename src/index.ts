import { ApolloServer, gql } from "apollo-server";
import { MssqlDataSource } from "@fish-and-richardson-pc/apollo-datasource-msnodesqlv8";
import { SqlClient } from "msnodesqlv8";

const sql: SqlClient = require("msnodesqlv8");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books(parameter: String): [Book]
  }
`;

class DataSource extends MssqlDataSource {
  queryData(parameter: string) {
    return this.query<{ Stuff: string }[]>(
`
        SELECT Stuff
        FROM Things
        WHERE OtherStuff = ${parameter}
      `
    ).then((v) => v.result);
  }
}

const pool = new sql.Pool({
  connectionString:
    "Driver={ODBC Driver 13 for SQL Server};Server=(localdb)\\node;Database=scratch;Trusted_Connection=yes;",
});

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      books: (
        _,
        { parameter }: { parameter: string },
        {
          dataSources: { dataSource },
        }: { dataSources: { dataSource: DataSource } }
      ) => dataSource.queryData(parameter),
    },
  },
  dataSources: () => ({
    dataSource: new DataSource(pool),
  }),
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
