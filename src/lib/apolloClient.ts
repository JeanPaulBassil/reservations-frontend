import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { useAuth } from "@/context/AuthContext";

export function useApolloClient() {
  const { token } = useAuth();

  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_API,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
    cache: new InMemoryCache(),
  });
}
