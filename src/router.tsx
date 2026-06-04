import { createBrowserRouter } from "react-router-dom";
import { StandaloneRoute } from "./routes/StandaloneRoute";

export const router = createBrowserRouter([
  { path: "/", element: <StandaloneRoute /> },
]);
