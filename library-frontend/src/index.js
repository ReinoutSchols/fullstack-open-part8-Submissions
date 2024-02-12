import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
});
/*
const query = gql`
  query {
    allAuthors {
      name
      born
      id
      bookCount
    }
  }
`;

client.query({ query }).then((response) => {
  console.log("response.data in index.js:", response.data);
});
*/
ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
);
