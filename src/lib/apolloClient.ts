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

// Configure cache with production-grade policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Products: cache for 5 minutes, then refetch
        products: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        // Customer data: always fetch fresh after mutations
        customer: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        // Orders: always fetch fresh
        orders: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        // Cart: no caching, always fresh
        cart: {
          merge: false,
        },
      },
    },
    Product: {
      keyFields: ['id'],
    },
    Order: {
      keyFields: ['id'],
    },
    Customer: {
      keyFields: ['id'],
    },
  },
});

const client = new ApolloClient({
  link: authLink.concat(new HttpLink({ uri: graphqlUri })),
  cache,
  // Default options for all queries
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', // Always check network for updates
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only', // Always fetch fresh data for queries
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client;
