import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Register from "./pages/Register";
import MainLayout from "./pages/MainLayout";
import { useEffect } from "react";
import { attachLoadingInterceptor } from "./api";
import { useLoading } from "./context/LoadingContext";
import { LoadingProvider } from "./context/LoadingProvider";


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

function AppContent() {
  const { setActiveRequests } = useLoading();

  useEffect(() => {
    attachLoadingInterceptor(setActiveRequests);
  }, [setActiveRequests]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
}

export default App;
