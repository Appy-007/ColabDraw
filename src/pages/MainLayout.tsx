import { Outlet } from "react-router-dom";
import Nav from "../components/Nav";
import { ToastContainer } from "react-toastify";

export default function MainLayout() {
  return (
    <>
      <div className="h-screen">
        <Nav />

        <div className="h-screen">
          <Outlet />
        </div>

        <ToastContainer className={"max-sm: text-sm max-sm:py-0.5"} position="top-center" autoClose={2000} />
      </div>
    </>
  );
}
