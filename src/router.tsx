import { createBrowserRouter } from "react-router-dom";
import { StandaloneRoute } from "./routes/StandaloneRoute";
import { EmbedRoute } from "./routes/EmbedRoute";
import { AdminRoute } from "./routes/AdminRoute";

export const router = createBrowserRouter([
  { path: "/", element: <StandaloneRoute /> },
  { path: "/embed", element: <EmbedRoute /> },
  { path: "/admin", element: <AdminRoute /> },
]);
