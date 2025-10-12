import { useState } from "react";
import CreateRoom from "../components/CreateRoom";
import JoinRoom from "../components/JoinRoom";

export default function Home() {

  const [isModalOpen,setIsModalOpen]=useState<number>(-1)
  const MODAL_TYPE={
    createRoom:0,
    joinRoom:1
  }

  const handleModal=(num:number)=>setIsModalOpen(num)

  return (
    <>
      <div className="flex h-screen items-center justify-center bg-stone-100">
        <div className="flex flex-col gap-10">
        <div>
          <h1 className="font-bold text-4xl pb-4">Collaborative</h1>
          <p className="font-bold text-4xl">WhiteBoard for Teams</p>
        </div>

        <div>
          <p className="text-gray-400 text-md text-left">Brainstorm,design and plan together, in real time</p>
        </div>

        <div className="flex justify-center gap-6">
          <button className="px-4 py-2 rounded-md bg-sky-400 text-white cursor-pointer" onClick={()=>handleModal(MODAL_TYPE.createRoom)}>Create new Whiteboard</button>
          <button className="px-4 py-2 rounded-md border border-sky-400 bg-white text-sky-400 cursor-pointer"
          onClick={()=>handleModal(MODAL_TYPE.joinRoom)}>Join Whiteboard</button>
        </div>
        </div>

       

       
      </div>

      {isModalOpen === MODAL_TYPE.createRoom && <CreateRoom isOpen={isModalOpen===MODAL_TYPE.createRoom} setShowModal={setIsModalOpen}/>}

      {isModalOpen === MODAL_TYPE.joinRoom && <JoinRoom isOpen={isModalOpen===MODAL_TYPE.joinRoom} setShowModal={setIsModalOpen}/>}
    </>
  );
}
