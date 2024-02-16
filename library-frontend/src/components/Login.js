/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN, ALL_BOOKS, ALL_AUTHORS } from "../queries";

const Login = ({ setToken, show }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login, result] = useMutation(LOGIN, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("library-user-token", token);
    }
  }, [result.data]);

  if (!show) {
    return null;
  }
  const onSubmit = async (event) => {
    event.preventDefault();
    login({ variables: { username, password } });
    setUsername("");
  };
  return (
    <div>
      <form onSubmit={onSubmit}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
