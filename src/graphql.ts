import { ApolloServer, gql } from "apollo-server-express";
import http from "http";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
	type Query {
		hello: String
	}
`;

// Provide resolver functions for your schema fields
const resolvers = {
	Query: {
		hello: () => "Hello world!",
	},
};

export const initApollo = async (app: any) => {
	const PORT = process.env.PORT || 5000;
	const httpServer = http.createServer(app);

	// Same ApolloServer initialization as before, plus the drain plugin.
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		csrfPrevention: false,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});
	// More required logic for integrating with Express
	await server.start();
	server.applyMiddleware({
		app,
		cors: {
			origin: [
				"http://localhost:3000",
				"http://localhost:3001",
				"http://localhost:4000",
				"http://localhost:5000/graphql",
				"http://localhost:5000",
				"https://studio.apollographql.com",
				"http://localhost:8080",
			],
		},

		// By default, apollo-server hosts its GraphQL endpoint at the
		// server root. However, *other* Apollo Server packages host it at
		// /graphql. Optionally provide this to match apollo-server.
		// path: "/",
	});

	// Modified server startup
	await new Promise<void>((resolve) => httpServer.listen(PORT, resolve));
	console.log(`🚀 Server ready at http://localhost:${PORT}`);
	process.on("SIGINT", () => httpServer.close());
};
