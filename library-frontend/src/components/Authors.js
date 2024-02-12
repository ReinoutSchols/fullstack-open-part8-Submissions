import { ALL_AUTHORS } from "../queries";
import { useQuery } from "@apollo/client";

const Authors = ({ show }) => {
  const { loading, data } = useQuery(ALL_AUTHORS);

  if (loading) {
    return <div>loading...</div>;
  }
  if (!show) {
    return null;
  }
  console.log(data.allAuthors, "authors in authors component:");

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Authors;
