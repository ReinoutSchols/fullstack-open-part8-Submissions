import { useState } from "react";
import { ADD_BOOK, ALL_AUTHORS, ALL_BOOKS } from "../queries";
import { useMutation } from "@apollo/client";
import { updateCache } from "../App";

const NewBook = (props) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const [createBook, { data, loading, error }] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
    update: (cache, response) => {
      updateCache(cache, { query: ALL_BOOKS }, response.data.addBook);
    },
  });

  if (!props.show) {
    return null;
  }

  if (loading) return "Submitting...";
  if (error) return `Submission error! ${error.message}`;
  console.log("logging data in newbook component:", data);
  const onSubmit = async (event) => {
    event.preventDefault();
    createBook({
      variables: { title, author, published: parseInt(published), genres },
    });
    console.log("created book:", createBook);

    setTitle("");
    setPublished("");
    setAuthor("");
    setGenres([]);
    setGenre("");
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
