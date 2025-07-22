import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./utils/silencer"; // Silence console in production

createRoot(document.getElementById("root")!).render(<App />);
