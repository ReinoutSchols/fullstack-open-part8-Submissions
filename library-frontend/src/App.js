import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { gql, useQuery } from "@apollo/client";

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      bookCount
      born
    }
  }
`;
const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author
      published
    }
  }
`;

const App = () => {
  const resultAll_AUTHORS = useQuery(ALL_AUTHORS);
  const resultAll_BOOKS = useQuery(ALL_BOOKS);

  const [page, setPage] = useState("authors");
  if (resultAll_AUTHORS.loading) {
    return <div>loading...</div>;
  }
  console.log("logging result of ALLauthors query in app:", resultAll_AUTHORS);
  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
      </div>

      <Authors show={page === "authors"} data={resultAll_AUTHORS.data} />

      <Books show={page === "books"} data={resultAll_BOOKS.data} />

      <NewBook show={page === "add"} />
    </div>
  );
};

export default App;
