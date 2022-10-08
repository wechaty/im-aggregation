import express from "express";
import CookieParser from "cookie-parser";
import Compression from "compression";
import path from "path";
import cors from "cors";
import router from "./router";

const app = express();
const port = 7777;

app.set("port", port);

/**
 * Express configuration. Load basic middleware and set up
 */
app.use(CookieParser());
app.use(Compression());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// set the static files location, for example: /public/img will be /img for users to access.
app.use("/", express.static(path.resolve(__dirname, "./public")));

app.use("/api/v1", router);

app.listen(app.get("port"), () => {
    console.log(`Server started on port http://localhost:${port}`);
});
