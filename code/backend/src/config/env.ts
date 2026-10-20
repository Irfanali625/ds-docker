import dotenv from "dotenv";
import path from "path";

// Single source of config: the repo-root .env (src/config -> repo root, same depth from dist/config).
// In Docker the variables are injected by docker-compose and this file is simply absent.
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
