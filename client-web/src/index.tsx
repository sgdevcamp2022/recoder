import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home, Room, Wait } from "./pages";
import store from "./redux/store";
import "./index.css";
import { Provider } from "react-redux";
import { Test } from "./pages/Test/Test";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/:roomId/",
    element: <Room />,
  },
  {
    path: "/wait/",
    element: <Wait />,
  },
  {
    path: "/test/",
    element: <Test />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
