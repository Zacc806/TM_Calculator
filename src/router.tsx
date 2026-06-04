import { createBrowserRouter } from "react-router-dom";
import { StandaloneRoute } from "./routes/StandaloneRoute";
import { EmbedRoute } from "./routes/EmbedRoute";
import { ClientRoute } from "./routes/ClientRoute";
import { BitrixRoute } from "./routes/BitrixRoute";
import { AdminRoute } from "./routes/AdminRoute";

export const router = createBrowserRouter([
  { path: "/", element: <StandaloneRoute /> },
  { path: "/embed", element: <EmbedRoute /> },
  { path: "/client", element: <ClientRoute /> },
  { path: "/bitrix", element: <BitrixRoute /> },
  { path: "/bitrix-deal", element: <BitrixRoute /> },
  { path: "/admin", element: <AdminRoute /> },
]);
