import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import AppRoutes from "./AppRoutes";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <ChakraProvider>
      <AppRoutes />
    </ChakraProvider>
  </BrowserRouter>
);

reportWebVitals();
