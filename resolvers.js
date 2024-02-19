const { GraphQLError } = require("graphql");
const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const resolvers = {
  Query: {
    bookCount: async () => await Book.collection.countDocuments(),
    authorCount: async () => await Author.collection.countDocuments(),
    allAuthors: async (root, args) => {
      return Author.find({});
    },
    allBooks: async (root, args) => {
      //  console.log("logging args in allbooks:", args);
      if (!args.genres) {
        let books = await Book.find({}).populate("author", "name born");
        //    console.log("logging books in allbooks:", books);
        return books;
      } else {
        let filteredBooks = await Book.find({
          genres: { $in: args.genres },
        }).populate("author", "name born");

        //     console.log("logging filteredbooks in allbooks:", filteredBooks);
        return filteredBooks;
      }
    },
    me: (root, args, context) => {
      console.log(context.currentUser);
      return context.currentUser;
    },
    booksByGenre: async (root, args) => {
      let filteredBooks = await Book.find({
        genres: { $in: args.genres },
      }).populate("author", "name");
      //     console.log("logging filteredbooks in allbooks:", filteredBooks);
      return filteredBooks;
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      console.log("logging currentuser in addbook:", context.currentUser);
      let author = await Author.findOne({ name: args.author });

      const book = new Book({
        title: args.title,
        published: args.published,
        author: author,
        genres: args.genres,
      });

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
        await book.save();
        console.log(`Book ${book.title} saved to MongoDB`);
      } catch (error) {
        console.error("Error adding book:", error);
        throw error;
      }
      pubsub.publish("BOOK_ADDED", { bookAdded: book });
      return book;
    },
    editAuthor: async (root, args, context) => {
      console.log("logging currentuser in editauthor:", context.currentUser);
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
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
};
module.exports = resolvers;
