import App from "./app";
// Routes
import ExternalRoutes from "@routes/external.routes";
import InternalRoutes from "@/routes/internal.routes";
import IndexRoutes from "@routes/index.routes";

const app = new App([
  new ExternalRoutes(),
  new InternalRoutes(),
  new IndexRoutes(),
]);

app.listenServer();
