import { toast } from "react-toastify";
import Logo from "../assets/Logo.png";
import { CiLogout } from "react-icons/ci";
import { matchPath, useLocation } from "react-router-dom";

export default function Nav() {

  const location = useLocation();

  const isRouteRegister = location.pathname === "/" || !!matchPath({ path: "/room/:roomId" }, location.pathname);;

  const handleLogout = () => {
    const data = localStorage.getItem("scribbleDraw-data");
    if (!data) {
      return;
    }
    localStorage.removeItem("scribbleDraw-data");
    toast.success("User Logged out successfully !");
    window.location.href = "/";
  };
  return (
    <>
      <div className="flex justify-between z-50 px-4 bg-white">
        <img src={Logo} alt="logo" width={150} />
        {!isRouteRegister && (
          <button onClick={handleLogout} className="cursor-pointer">
            <CiLogout size={30} />
          </button>
        )}
      </div>
    </>
  );
}
