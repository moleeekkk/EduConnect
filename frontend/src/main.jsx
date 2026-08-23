import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { BatchProvider } from "./context/BatchContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <BatchProvider>
      <App />
    </BatchProvider>
  </BrowserRouter>,
);
