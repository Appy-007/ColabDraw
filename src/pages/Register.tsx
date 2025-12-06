import { useState } from "react";
import RegisterForm from "../components/RegsiterForm";
import Login from "../components/Login";

export default function Register() {
  const [isModalOpen, setIsModalOpen] = useState<number>(-1);
  const MODAL_TYPE = {
    register: 0,
    login: 1,
  };

  const handleModal = (num: number) => setIsModalOpen(num);
  return (
    <>
      <div className="flex h-10/12 items-center justify-center  bg-stone-100">
        <div className="flex flex-col gap-10">
          <div>
            <h1 className="font-bold text-4xl pb-2">Play, Draw, Guess !</h1>
          </div>

          <div>
            <p className="text-gray-400 text-md text-left">
             The drawing game just to enjoy at your desk with your colleagues
            </p>
          </div>

          <div className="flex gap-6">
            <button
              className="px-4 py-2 rounded-md bg-sky-400 text-white cursor-pointer"
              onClick={() => handleModal(MODAL_TYPE.register)}
            >
              Register
            </button>
            <button
              className="px-4 py-2 rounded-md border border-sky-400 bg-white text-sky-400 cursor-pointer"
              onClick={() => handleModal(MODAL_TYPE.login)}
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {isModalOpen===MODAL_TYPE.register && <RegisterForm isOpen={isModalOpen===MODAL_TYPE.register} setShowModal={setIsModalOpen}/>}

      {isModalOpen===MODAL_TYPE.login && <Login isOpen={isModalOpen===MODAL_TYPE.login} setShowModal={setIsModalOpen}/>}
    </>
  );
}
