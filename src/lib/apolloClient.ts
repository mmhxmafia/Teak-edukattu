import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

// Try to get the GraphQL endpoint from environment variables, or use a fallback URL
const graphqlUri = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'https://admin.teakacacia.com/graphql';

// Log the GraphQL endpoint for debugging
console.log('GraphQL Endpoint:', graphqlUri);

// Auth middleware to add token to requests
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('authToken');
  
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });
  
  return forward(operation);
});

const client = new ApolloClient({
  link: authLink.concat(new HttpLink({ uri: graphqlUri })),
  cache: new InMemoryCache(),
});

export default client;
