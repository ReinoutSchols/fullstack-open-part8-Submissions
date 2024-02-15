const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v4: uuidv4 } = require("uuid");
const { GraphQLError } = require("graphql");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI.replace(
  "<password>",
  process.env.PASSWORD,
);
console.log("connecting to", process.env.MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

/*
const deleteUsers = async () => {
  await User.collection.drop();
};
deleteUsers();
*/
const typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(genres: [String]): [Book]
    allAuthors: [Author]
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!
    editAuthor(
      name: String!
      setBornTo:Int!
      ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => await Book.collection.countDocuments(),
    authorCount: async () => await Author.collection.countDocuments(),
    allAuthors: async (root, args) => {
      return Author.find({});
    },
    allBooks: async (root, args) => {
      console.log("logging args in allbooks:", args);
      if (!args.genres) {
        let books = await Book.find({}).populate("author", "name born");
        console.log("logging books in allbooks:", books);
        return books;
      } else {
        let filteredBooks = await Book.find({
          genres: { $in: args.genres },
        }).populate("author", "name born");

        console.log("logging filteredbooks in allbooks:", filteredBooks);
        return filteredBooks;
      }
    },
    me: (root, args, context) => {
      console.log(context.currentUser);
      return context.currentUser;
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("User needs to be logged in to add books ", {
          extensions: {
            code: "INVALID_USER",
          },
        });
      }
      try {
        console.log("args:", args);
        if (args.title.length < 5 || args.author.length < 5) {
          throw new GraphQLError(
            "Invalid user input: title and author name must be longer than 5 ",
            {
              extensions: {
                code: "BAD_USER_INPUT",
              },
            },
          );
        }
        const existingBook = await Book.findOne({ title: args.title });
        if (existingBook) {
          throw new GraphQLError("A book with the same title already exists", {
            extensions: {
              code: "DUPLICATE_TITLE",
            },
          });
        }
        let author = await Author.findOne({ name: args.author });
        if (!author) {
          author = new Author({
            name: args.author,
          });
          console.log(
            "logging author after adding book with new author:",
            author,
          );
          await author.save();
          console.log(`Author ${author.name} saved to MongoDB`);
        }
        console.log("logging author in adddBook:", author);
        const book = new Book({
          title: args.title,
          published: args.published,
          author: author,
          genres: args.genres,
        });
        await book.save();

        console.log(`Book ${book.title} saved to MongoDB`);
        return book;
      } catch (error) {
        console.error("Error adding book:", error);
        throw error;
      }
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("User needs to be logged in to edit author ", {
          extensions: {
            code: "INVALID_USER",
          },
        });
      }
      let author = await Author.findOne({ name: args.name });
      console.log("logging args in editauthor:", args);
      console.log("logging author in editauthor before updating:", author);
      if (!author) {
        return null;
      } else {
        await Author.collection.updateOne(
          { name: author.name },
          { $set: { born: args.setBornTo } },
        );
        return await Author.findOne({ name: args.name });
      }
    },

    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    // console.log("logging auth in context", auth);
    if (auth && auth.startsWith("bearer ")) {
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET,
      );
      //  console.log("logging decoded token:", decodedToken);
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
