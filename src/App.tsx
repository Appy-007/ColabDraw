import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Register from "./pages/Register";
import MainLayout from "./pages/MainLayout";
import { useEffect, useState } from "react";
import { attachLoadingInterceptor } from "./api";
import { useLoading } from "./context/LoadingContext";
import { LoadingProvider } from "./context/LoadingProvider";
import axios from "axios";


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
  const [isServerAwake, setIsServerAwake] = useState(false);
  const baseURL=import.meta.env.VITE_MODE === "PRODUCTION" ? import.meta.env.VITE_BACKEND_URL : 'http://localhost:3000'


  useEffect(() => {
    attachLoadingInterceptor(setActiveRequests);
    const checkBackend = async () => {
      try {
        await axios.get(baseURL, { timeout: 5000 });
        setIsServerAwake(true);
      } catch (err) {
        console.log("Waiting for backend to spin up...",err);
        setTimeout(checkBackend, 3000); // Retry every 3 seconds
      }
    };

    checkBackend();
  }, [setActiveRequests]);

  if(!isServerAwake) return <ServerWakeUpLoader/>

  return <RouterProvider router={router} />;
}

function App() {
  
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
}

  const ServerWakeUpLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 z-[9999] text-center p-4">
    {/* Spinner */}
    <div className="w-14 h-14 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-6"></div>

    {/* Text Content */}
    <h2 className="text-2xl font-bold text-slate-800 mb-2">
      Preparing your drawing board...
    </h2>
    <p className="text-slate-600 max-w-md mb-6">
      The backend service is waking up (takes ~30s).
    </p>

    {/* Progress Bar Container */}
    <div className="w-full max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-500 rounded-full animate-[loading_30s_linear_forwards]"
      ></div>
    </div>
  </div>
);

export default App;
