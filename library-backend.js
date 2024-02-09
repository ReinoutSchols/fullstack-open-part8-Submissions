const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v4: uuidv4 } = require("uuid");

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

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
 */

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

const typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }
  type Book {
    title: String
    published: Int
    author: String
    id: ID
    genres: [String]
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author]
  }

  type Mutation {
  addBook(
    title: String
    author: String
    published: Int
    genres: [String]
  ): Book
  editAuthor(
    name: String!
    setBornTo:Int!
    ): Author
}
`;

authors.forEach((author) => {
  author.bookCount = books.filter((book) => book.author === author.name).length;
});

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allAuthors: () => authors,
    allBooks: (root, args) => {
      console.log("argument passed in allBooks:", args);

      // filtering based on the author
      const countOfBooksByAuthor = books.filter(
        (b) => b.author === args.author,
      );
      // filtering based on books
      const booksByGenre = books.filter((b) => b.genres.includes(args.genre));

      if (args.author && args.genre) {
        const BooksByGenreAndAuthor = booksByGenre.filter(
          (b) => b.author === args.author,
        );
        return BooksByGenreAndAuthor;
      } else if (args.author) {
        console.log("countOfBooksByAuthor:", countOfBooksByAuthor);
        return countOfBooksByAuthor;
      } else if (args.genre) {
        console.log("booksByGenre:", booksByGenre);
        return booksByGenre;
      } else {
        console.log("all books:", books);
        return books;
      }
    },
  },
  Mutation: {
    addBook: (root, args) => {
      const { title, author, published, genres } = args;
      let existingAuthor = authors.find((a) => a.name === author);
      const book = {
        title,
        author: author,
        published,
        genres,
        id: uuidv4(),
      };
      if (!existingAuthor) {
        existingAuthor = { name: author, id: uuidv4(), bookCount: 1 };
        authors.push(existingAuthor);
      } else {
        existingAuthor.bookCount++;
      }
      books.push(book);
      console.log("authorswbookcount:", authors);
      return book;
    },
    editAuthor: (root, args) => {
      const author = authors.find((a) => a.name === args.name);
      console.log("logging author in editauthor:", author);
      console.log("logging args in editauthor:", args);

      if (!author) {
        return null;
      } else {
        const updatedAuthor = { ...author, born: args.setBornTo };
        console.log("logging updated author in editauthor:", updatedAuthor);
        console.log("logging authorsWithBookCount in editauthor:", authors);
        authors.map((a) => (a.name === args.name ? updatedAuthor : a));
        return updatedAuthor;
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
