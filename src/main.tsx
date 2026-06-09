import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OnlineApp } from "./OnlineApp";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<StrictMode><OnlineApp /></StrictMode>);
