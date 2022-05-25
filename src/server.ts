import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
import express, { Request, Response } from "express";
import { initApollo } from "./graphql";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import helmet from "helmet";
import { expressjwt, GetVerificationKey } from "express-jwt";
import jwksRsa from "jwks-rsa";
const PORT = process.env.API_PORT || 5000;
const app = express();
const baseUrl = process.env.AUTH0_BASE_URL;
const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;
const audience = process.env.AUTH0_AUDIENCE;
if (!baseUrl || !issuerBaseUrl) {
	throw new Error(
		"Please make sure that the file .env.local is in place and populated"
	);
}

if (!audience) {
	console.log(
		"AUTH0_AUDIENCE not set in .env.local. Shutting down API server."
	);
	process.exit(1);
}
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(morgan("combined"));
app.use(helmet());
const allowlist = [
	"http://localhost:3000",
	"http://localhost:3001",
	"http://localhost:4000",
	"http://localhost:5000/graphql",
	"http://localhost:5000",
	"https://studio.apollographql.com",
	"http://localhost:8080",
];
interface CorsRequest extends Request {
	header: any;
}
export const corsOptionsDelegate = function (req: CorsRequest, callback: any) {
	let corsOptions: any;
	if (allowlist.indexOf(req.header("Origin")) !== -1) {
		corsOptions = { origin: true, credentials: true }; // reflect (enable) the requested origin in the CORS response
	} else {
		corsOptions = { origin: false }; // disable CORS for this request
	}
	callback(null, corsOptions); // callback expects two parameters: error and options
};
app.use(cors(corsOptionsDelegate));

const checkJwt = expressjwt({
	secret: jwksRsa.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5,
		jwksUri: `${issuerBaseUrl}/.well-known/jwks.json`,
	}) as GetVerificationKey,
	audience: audience,
	issuer: `${issuerBaseUrl}/`,
	algorithms: ["RS256"],
});
//app.use(checkJwt);
initApollo(app);
const DBURL: any = process.env.MONGO_URL;
mongoose.connect(DBURL).catch(async (err: any) => {
	await mongoose.disconnect();
	console.log("err occured", err);
});
mongoose.connection.once("open", () => {
	console.log("Connected to MongoDB");
});
mongoose.connection.once("close", () => {
	console.log("Disconnected");
});

app.get("/", (req: Request, res: Response) => {
	res.send("Hello, World!");
});
