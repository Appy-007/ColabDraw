import { useRef, type FormEvent } from "react";
import type { FormPropTypes } from "./CreateRoom";
import Modal from "./Modal";
import { toast } from "react-toastify";
import { authApi } from "../api";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

export default function Login({ isOpen, setShowModal }: FormPropTypes) {
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    const data = Object.fromEntries(formData);
    if (!data.email || !data.password) {
      toast.error("Please enter all the fields");
      return;
    }
    if (data.password.toString().trim().length < 6) {
      toast.error("Incorrect password.Password must be 6 char long");
      return;
    }
    try {
      const apiData = {
        email: data.email.toString().trim(),
        password: data.password.toString().trim(),
      };
      const response = await authApi.login(apiData);
      if (response?.data?.data)
        localStorage.setItem("data", JSON.stringify(response.data.data));
      toast.success(response.data.message);
      navigate("/home");
    } catch (error) {
      const axiosError = error as AxiosError;
      console.log(axiosError);
      const message = `An error occurred during login.`;
      toast.error(message);
    }
  };
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setShowModal(-1)}
        targetRoot="modal-root"
      >
        <div>
          <form
            ref={formRef}
            className="flex flex-col gap-4"
            action=""
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-0.5">
              <label htmlFor="name">Email</label>
              <input
                className=" outline-none border border-gray-400 px-2 py-1 rounded-md"
                type="text"
                placeholder="Enter your email"
                name="email"
                id="email"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label htmlFor="name">Password</label>
              <input
                className=" outline-none border border-gray-400 px-2 py-1 rounded-md"
                type="text"
                placeholder="Enter your password"
                name="password"
                id="password"
              />
            </div>

            <button className="cursor-pointer text-white bg-sky-400 font-bold py-2 px-4 rounded">
              Login
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}
