import { useEffect, useState } from "react";
import RegisterForm from "../components/RegsiterForm";
import Login from "../components/Login";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api";
import { toast } from "react-toastify";

export default function Register() {
  const [isModalOpen, setIsModalOpen] = useState<number>(-1);
  const MODAL_TYPE = {
    register: 0,
    login: 1,
  };

  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      try {
        await authApi.verify();
        navigate("/home");
      } catch (error) {
        console.log(error);
        localStorage.removeItem("scribbleDraw-data");
        toast.error("Session expired ...please login again")       
      }
    };
    const getDataFromLocalStorage = localStorage.getItem("scribbleDraw-data");
    if (getDataFromLocalStorage) {
      try {
        const parsedData = JSON.parse(getDataFromLocalStorage);
        if (parsedData && parsedData.user) {
          validateToken();
        }
      } catch (error) {
        toast.error("Token not found...please register or login again")
        console.error("Error parsing local storage data:", error);
      }
    }
  }, [navigate]);

  const handleModal = (num: number) => setIsModalOpen(num);
  return (
    <>
      <div className="flex h-full items-center justify-center  bg-stone-100">
        <div className="flex flex-col gap-10">
          <div>
            <h1 className="font-bold text-3xl  sm:text-5xl pb-2 font-stretch-extra-expanded">
              Join the Fun !
            </h1>
          </div>

          <div>
            <p className="text-gray-400 font-bold text-lg sm:text-2xl text-left font-stretch-extra-expanded">
              Ready to draw, guess & win ?
            </p>
          </div>

          <div className="flex gap-6">
            <button
              className="max-sm:text-sm px-4 py-2 rounded-md bg-sky-400 text-white cursor-pointer"
              onClick={() => handleModal(MODAL_TYPE.register)}
            >
              Register
            </button>
            <button
              className="max-sm:text-sm px-4 py-2 rounded-md border border-sky-400 bg-white text-sky-400 cursor-pointer"
              onClick={() => handleModal(MODAL_TYPE.login)}
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {isModalOpen === MODAL_TYPE.register && (
        <RegisterForm
          isOpen={isModalOpen === MODAL_TYPE.register}
          setShowModal={setIsModalOpen}
        />
      )}

      {isModalOpen === MODAL_TYPE.login && (
        <Login
          isOpen={isModalOpen === MODAL_TYPE.login}
          setShowModal={setIsModalOpen}
        />
      )}
    </>
  );
}
