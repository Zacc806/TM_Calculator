import { createBrowserRouter } from "react-router-dom";
import { StandaloneRoute } from "./routes/StandaloneRoute";
import { EmbedRoute } from "./routes/EmbedRoute";

export const router = createBrowserRouter([
  { path: "/", element: <StandaloneRoute /> },
  { path: "/embed", element: <EmbedRoute /> },
]);
