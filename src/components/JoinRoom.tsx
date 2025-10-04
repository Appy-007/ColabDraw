import Modal from "./Modal";

export type FormPropTypes = {
  isOpen: boolean;
  setShowModal: (num: number) => void;
};

export default function JoinRoom({ isOpen, setShowModal }: FormPropTypes) {
  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setShowModal(-1)}>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-sky-400 ">Join Room</h2>
          <form className="flex flex-col gap-4" action="">
            <input
              className=" outline-none border border-gray-400 px-2 py-1 rounded-md"
              type="text"
              placeholder="Enter your name"
              name="name"
              id="name"
            />

            <input
              className=" outline-none border border-gray-400 px-2 py-1 rounded-md"
              type="text"
              placeholder="Enter room code"
              name="name"
              id="name"
            />

            <button className="cursor-pointer text-white bg-sky-400 font-bold py-2 px-4 rounded">
              Join Room
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}
