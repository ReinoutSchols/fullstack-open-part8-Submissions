/* eslint-disable react-hooks/exhaustive-deps */
import { ALL_BOOKS, BOOKSBYGENRE } from "../queries";
import { useQuery, useLazyQuery } from "@apollo/client";
import Select from "react-select";
import { useState, useEffect } from "react";

const Books = ({ show }) => {
  const { loading, data } = useQuery(ALL_BOOKS);
  const [selectedOption, setSelectedOption] = useState(null);
  const [
    fetchBooks,
    { loading: booksLoading, error: booksError, data: booksData },
  ] = useLazyQuery(BOOKSBYGENRE);

  useEffect(() => {
    if (selectedOption) {
      console.log("selecedOption", selectedOption);
      fetchBooks({ variables: { genres: selectedOption.value } });
    }
  }, [selectedOption]);
  if (loading) {
    return <div>loading...</div>;
  }
  if (!show) {
    return null;
  }
  // console.log("logging data in books component:", data);
  const genres = data.allBooks.map((g) => {
    return { value: g.genres, label: g.genres };
  });
  // console.log("logging allgenres in books: ", genres);
  const result = [...new Set(genres.flatMap(({ value }) => value))].sort();
  //  console.log("result", result);
  const uniqueGenres = result.map((g) => {
    return { value: g, label: g };
  });
  // console.log("uniqueGenres", uniqueGenres);

  return (
    <div>
      <h2>books</h2>
      {selectedOption ? (
        <>
          <p>
            {" "}
            in genre <strong>{selectedOption.label}</strong>
          </p>
          {booksLoading && <div>Loading books...</div>}
          {booksError && <div>Error fetching books!</div>}
          {booksData && (
            <table>
              <tbody>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Published</th>
                </tr>
                {booksData.booksByGenre.map((book) => (
                  <tr key={book.title}>
                    <td>{book.title}</td>
                    <td>{book.author.name}</td>
                    <td>{book.published}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <>
          <table>
            <tbody>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Published</th>
              </tr>
              {data.allBooks.map((book) => (
                <tr key={book.title}>
                  <td>{book.title}</td>
                  <td>{book.author.name}</td>
                  <td>{book.published}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <Select
        value={selectedOption}
        onChange={setSelectedOption}
        options={uniqueGenres}
        isClearable
        placeholder="Filter by genre"
      />
    </div>
  );
};

export default Books;
