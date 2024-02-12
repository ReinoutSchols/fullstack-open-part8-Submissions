import { useState } from "react";
import { ALL_AUTHORS, EDIT_BIRTHYEAR } from "../queries";
import { useMutation, useQuery } from "@apollo/client";

const Authors = ({ show }) => {
  const { loading, data: authorsData } = useQuery(ALL_AUTHORS);
  const [name, setName] = useState("");
  const [setBornTo, setsetBornTo] = useState("");

  const [editAuthor, { data }] = useMutation(EDIT_BIRTHYEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  if (loading) {
    return <div>loading...</div>;
  }
  if (!show) {
    return null;
  }
  // console.log(authorsData.allAuthors, "authors in authors component:");

  const onSubmit = (event) => {
    event.preventDefault();
    console.log("trying to setBorn...");
    editAuthor({
      variables: { name, setBornTo: parseInt(setBornTo) },
    });
    setsetBornTo("");
    setName("");
    console.log("updated author in onSubmit update author:", data);
  };
  return (
    <div>
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>born</th>
              <th>books</th>
            </tr>
            {authorsData.allAuthors.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Set birthyear</h2>
      <form onSubmit={onSubmit}>
        <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          ></input>
        </div>
        <div>
          born
          <input
            value={setBornTo}
            onChange={({ target }) => setsetBornTo(target.value)}
          ></input>
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
