import { Request } from "express";
const allowlist = [
	"http://localhost:3000",
	"http://localhost:3001",
	"http://localhost:4000",
	"http://localhost:5000/graphql",
	"http://localhost:5000",
	"https://studio.apollographql.com",
	"http://localhost:8080",
];

export const corsOptionsDelegate = function (req: Request, callback: any) {
	let corsOptions: any;
	if (allowlist.indexOf(req.header("Origin")) !== -1) {
		corsOptions = { origin: true, credentials: true }; // reflect (enable) the requested origin in the CORS response
	} else {
		corsOptions = { origin: false }; // disable CORS for this request
	}
	callback(null, corsOptions); // callback expects two parameters: error and options
};
