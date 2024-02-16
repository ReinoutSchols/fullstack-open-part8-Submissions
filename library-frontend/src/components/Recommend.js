/* eslint-disable react-hooks/exhaustive-deps */
import { ALL_BOOKS } from "../queries";
import { useQuery } from "@apollo/client";
import { ME } from "../queries";

const Recommend = ({ show }) => {
  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(ME);

  const { loading: booksLoading, data: booksData } = useQuery(ALL_BOOKS);

  if (booksLoading || userLoading) {
    return <div>loading...</div>;
  }

  if (!show || !userData || !userData.me) {
    return null;
  }

  const favoriteGenre = userData.me.favoriteGenre.toLowerCase();
  const recommendedBooks = booksData.allBooks
    .filter((book) => book.genres.includes(favoriteGenre))
    .map((book) => (
      <tr key={book.title}>
        <td>{book.title}</td>
        <td>{book.author.name}</td>
        <td>{book.published}</td>
      </tr>
    ));

  return (
    <div>
      <h2>recommendations for {userData.me.username}</h2>
      <table>
        <tbody>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {recommendedBooks}
        </tbody>
      </table>
    </div>
  );
};

export default Recommend;
