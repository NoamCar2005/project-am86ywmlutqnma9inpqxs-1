// This is the main entry point of the AdCraftAI web application.
// It tells the browser how to start the app and where to put it on the page.
//
// What happens here:
// 1. We import the tools needed to show our app on the web page.
// 2. We import the main App component, which is the heart of our app.
// 3. We import the main CSS file to style the app.
// 4. We tell the browser to put our App inside the HTML element with the id 'root'.

import { createRoot } from "react-dom/client"; // Tool to show React apps in the browser
import App from "./App.tsx"; // The main part of our app
import "./index.css"; // The main styles for our app

createRoot(document.getElementById("root")!).render(<App />); // Start the app and show it on the page
