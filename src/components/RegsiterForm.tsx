import { useRef, type FormEvent } from "react";
import type { FormPropTypes } from "./CreateRoom";
import Modal from "./Modal";
import { toast } from "react-toastify";
import { authApi } from "../api";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
export default function RegisterForm({ isOpen, setShowModal }: FormPropTypes) {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    const data = Object.fromEntries(formData);
    if (!data.name || !data.email || !data.password) {
      toast.error("Please enter all the fields");
      return;
    }
    if (data.password && data.password.toString().trim().length < 6) {
      toast.error("Password must be 6 characters long");
      return;
    }

    try {
      const apiData = {
        name: data.name.toString().trim(),
        email: data.email.toString().trim(),
        password: data.password.toString().trim(),
      };
      const response = await authApi.register(apiData);
      if (response?.data?.data)
        localStorage.setItem("data", JSON.stringify(response.data.data));
      toast.success("User registered successfully");
      navigate("/home");
    } catch (error) {
      const axiosError = error as AxiosError;
      console.log(axiosError);
      const message = `An error occurred during register.`;
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
              <label htmlFor="name">Name</label>
              <input
                className=" outline-none border border-gray-400 px-2 py-1 rounded-md"
                type="text"
                placeholder="Enter your name"
                name="name"
                id="name"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label htmlFor="name">Email</label>
              <input
                className=" outline-none border border-gray-400 px-2 py-1 rounded-md"
                type="email"
                placeholder="Enter your email"
                name="email"
                id="email"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label htmlFor="name"> Create Password</label>
              <input
                className=" outline-none border border-gray-400 px-2 py-1 rounded-md"
                type="text"
                placeholder="Password must be 6 char long"
                name="password"
                id="password"
              />
            </div>

            <button className="cursor-pointer text-white bg-sky-400 font-bold py-2 px-4 rounded">
              Register
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}
