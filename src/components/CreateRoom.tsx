import {useState } from "react";
import Modal from "./Modal";
import { nanoid } from "nanoid";
import { toast } from "react-toastify";
import { roomApi } from "../api";
import { useNavigate } from "react-router-dom";
// import getAuthenticatedSocket from "../utils/socket";
// import type { Socket } from "socket.io-client";

export type FormPropTypes = {
  isOpen: boolean;
  setShowModal: (num: number) => void;
};

type CreateRoomType = {
  name: string;
  roomId: string;
};

export default function CreateRoom({ isOpen, setShowModal }: FormPropTypes) {
  const navigate=useNavigate()
  const [createRoom, setCreateRoom] = useState<CreateRoomType>({
    name: "",
    roomId: "",
  });



  

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    event.preventDefault();
    setCreateRoom((prev) => {
      return {
        ...prev,
        [name]: event.target.value,
      };
    });
  };

  const generateRoomId = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    const roomId = nanoid();
    setCreateRoom((prev) => {
      return {
        ...prev,
        ["roomId"]: roomId,
      };
    });
  };

  const copyToClipBoard = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(createRoom.roomId);
      toast.success("Room Id copied to your clipboard");
    } catch (err) {
      console.log(err);
      toast.error("Failed to copy room Id");
    }
  };

 

  const handleSubmit = async(event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createRoom.name || !createRoom.roomId) {
      toast.error("Please enter all the fields");
      return;
    }
    const socketData = {
      name: createRoom.name.trim(),
      roomId: createRoom.roomId.trim(),
    };

    try {
    const resp=await roomApi.createRoom(socketData)
    // console.log(resp)
    if(!resp){
      toast.error('Error occured in creating room')
      throw new Error('Error occured in creating room')
    }
    const roomId=resp.data.data.roomId
    toast.success('Room created successfully !')
    navigate(`/room/${roomId}`)
    } catch (error) {
      console.log(error) 
    } 
  };
  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setShowModal(-1)}>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-sky-400 ">Create Room</h2>
          <form
            className="flex flex-col gap-4"
            action=""
            onSubmit={handleSubmit}
          >
            <input
              className=" outline-none border border-gray-400 px-2 py-1 rounded-md"
              type="text"
              placeholder="Enter your name"
              name="name"
              id="name"
              value={createRoom?.name}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handleChange(event, "name")
              }
            />

            <div className="flex justify-between items-center gap-4">
              <input
                className=" outline-none border border-gray-400 px-2 py-1 rounded-md"
                type="text"
                placeholder="Click the Generate button"
                name="roomId"
                id="roomId"
                value={createRoom?.roomId}
                disabled={true}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="cursor-pointer text-white bg-sky-400 font-bold py-2 px-4 rounded"
                  onClick={(event) => generateRoomId(event)}
                >
                  Generate
                </button>
                <button
                  type="button"
                  className="cursor-pointer font-bold py-2 px-4 border border-sky-400 text-sky-400 rounded"
                  onClick={(event) => copyToClipBoard(event)}
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="cursor-pointer text-white bg-sky-400 font-bold py-2 px-4 rounded"
            >
              Create Room
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}
