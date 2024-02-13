const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v4: uuidv4 } = require("uuid");
const { GraphQLError } = require("graphql");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Author = require("./models/author");
const Book = require("./models/book");

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
let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];
*/
/*
authors.forEach(async (authorData) => {
  try {
    const author = new Author(authorData);
    await author.save();
    console.log(`Author ${author.name} saved to MongoDB`);
  } catch (error) {
    console.error(`Error saving author ${authorData.name}:`, error);
  }
});
let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "The Demon ",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

books.forEach(async (bookData) => {
  try {
    const author = await Author.findOne({ name: bookData.author });
    console.log(author);

    if (!author) {
      console.error("author not found");
      return;
    }
    const book = new Book({
      ...bookData,
      author,
    });
    await book.save();
    console.log(`Book ${book.title} saved to MongoDB`);
  } catch (error) {
    console.error(`Error saving author ${bookData.title}:`, error);
  }
});
*/

/*
const booksWithAuthors = async () => {
  return await Book.find({}).populate("author");
};

booksWithAuthors()
  .then((result) => {
    console.log("Books with authors:", result);
  })
  .catch((error) => {
    console.error("Error fetching books with authors:", error);
  });
*/
const typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
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
}
`;
/*
authors.forEach((author) => {
  author.bookCount = books.filter((book) => book.author === author.name).length;
});
*/
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
  },
  Mutation: {
    addBook: async (root, args) => {
      try {
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
    editAuthor: async (root, args) => {
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
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
