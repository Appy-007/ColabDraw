import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Nav from "./components/Nav";
import Register from "./pages/Register";
import { ToastContainer } from "react-toastify";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Register />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/room/:roomId",
    element: <Room />,
  },
]);

function App() {
  return (
    <>
      <div className="h-screen">
        <Nav />
        <RouterProvider router={router} />
        <ToastContainer position="top-center" autoClose={2000} />
      </div>
    </>
  );
}

export default App;
