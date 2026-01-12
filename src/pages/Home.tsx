import { useState } from "react";
import CreateRoom from "../components/CreateRoom";
import JoinRoom from "../components/JoinRoom";

const DESCRIPTIONS_ARR = [
  {
    title: "Create Room",
    description:
      "Create a room using an unique room Id ...you will play as a drawer",
  },
  {
    title: "Join Room",
    description:
      "Join an existing room ...maximum of 5 players are recommended to join at this time",
  },
  {
    title: "Draw and guess word",
    description:
      "Drawer wil get a random word...the other ones will guess and earn points",
  },
  {
    title: "Instantly updated scoreboard",
    description:
      "On each correct guess the player will earn points...no negative marks on wrong guess !!",
  },
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState<number>(-1);
  const MODAL_TYPE = {
    createRoom: 0,
    joinRoom: 1,
  };

  const handleModal = (num: number) => setIsModalOpen(num);

  return (
    <>
      <div className="flex px-8 h-8/12 items-center  bg-stone-100">
        <div className="flex flex-col items-start gap-8">
          <div>
            <h1 className="font-bold text-3xl sm:text-5xl py-2">
              Welcome to Scribble Draw
            </h1>
          </div>

          <div>
            <p className="text-gray-400 text-md text-left">
              Show your imagination and drawing skills in real time
            </p>
          </div>

          <div className="flex justify-center gap-6">
            <button
              className="max-sm:text-sm px-4 py-2 rounded-md bg-sky-400 text-white cursor-pointer"
              onClick={() => handleModal(MODAL_TYPE.createRoom)}
            >
              Create new Whiteboard
            </button>
            <button
              className="max-sm:text-sm px-4 py-2 rounded-md border border-sky-400 bg-white text-sky-400 cursor-pointer"
              onClick={() => handleModal(MODAL_TYPE.joinRoom)}
            >
              Join Whiteboard
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pt-6 pb-8">
        <p className="font-bold text-lg">How it works</p>
        <div className="grid grid-cols-2 justify-center mt-4  gap-4">
          {DESCRIPTIONS_ARR.length > 0 &&
            DESCRIPTIONS_ARR.map((item,index) => (
              <div key={index} className="border-2 p-4  rounded border-sky-400 max-w-80">
                <p className="text-md sm:text-lg font-semibold">{item.title}</p>
                <p className="text-xs sm:text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
        </div>
      </div>

      {isModalOpen === MODAL_TYPE.createRoom && (
        <CreateRoom
          isOpen={isModalOpen === MODAL_TYPE.createRoom}
          setShowModal={setIsModalOpen}
        />
      )}

      {isModalOpen === MODAL_TYPE.joinRoom && (
        <JoinRoom
          isOpen={isModalOpen === MODAL_TYPE.joinRoom}
          setShowModal={setIsModalOpen}
        />
      )}
    </>
  );
}
