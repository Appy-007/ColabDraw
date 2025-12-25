import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Nav from "./components/Nav";
import Register from "./pages/Register";
import { ToastContainer } from "react-toastify";
import MainLayout from "./pages/MainLayout";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Register />,
//   },
//   {
//     path: "/home",
//     element: <Home />,
//   },
//   {
//     path: "/room/:roomId",
//     element: <Room />,
//   },
// ]);

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <Register />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "room/:roomId",
        element: <Room />,
      },
    ],
  },
]);

function App() {
  return (
    <>
        <RouterProvider router={router} />
    </>
  );
}

export default App;
