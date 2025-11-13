import { useState } from "react";
import Modal from "./Modal";
import { toast } from "react-toastify";
import { roomApi } from "../api";
import { useNavigate } from "react-router-dom";

export type FormPropTypes = {
  isOpen: boolean;
  setShowModal: (num: number) => void;
};

type JoinRoomType = {
  name: string;
  roomId: string;
};

export default function JoinRoom({ isOpen, setShowModal }: FormPropTypes) {
  const [joinRoom,setJoinRoom]=useState<JoinRoomType>({
    name:"",
    roomId:""
  })

  const navigate=useNavigate()

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    event.preventDefault();
    setJoinRoom((prev) => {
      return {
        ...prev,
        [name]: event.target.value,
      };
    });
  };

  const handleSubmit = async(event: React.ChangeEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!joinRoom.name || !joinRoom.roomId) {
        toast.error("Please enter all the fields");
        return;
      }
      const socketData = {
        name: joinRoom.name.trim(),
        roomId: joinRoom.roomId.trim(),
      };
  
      try {
      const resp=await roomApi.joinRoom(socketData)
      // console.log(resp)
      if(!resp){
        toast.error('Error occured in creating room')
        throw new Error('Error occured in creating room')
      }
      const roomId=resp.data.data.roomId
      toast.success('Room joined successfully !')
      navigate(`/room/${roomId}`)
      } catch (error) {
        console.log(error) 
      } 
    };
  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setShowModal(-1)}>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-sky-400 ">Join Room</h2>
          <form className="flex flex-col gap-4" action="" onSubmit={handleSubmit}>
            <input
              className=" outline-none border border-gray-400 px-2 py-1 rounded-md"
              type="text"
              placeholder="Enter your name"
              name="name"
              id="name"
              value={joinRoom.name}
              onChange={(e)=>handleChange(e,"name")}
            />

            <input
              className=" outline-none border border-gray-400 px-2 py-1 rounded-md"
              type="text"
              placeholder="Enter room code"
              name="roomId"
              id="roomId"
               value={joinRoom.roomId}
              onChange={(e)=>handleChange(e,"roomId")}
            />

            <button  type="submit" className="cursor-pointer text-white bg-sky-400 font-bold py-2 px-4 rounded">
              Join Room
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}
