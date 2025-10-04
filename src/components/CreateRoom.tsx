import Modal from "./Modal";

export type FormPropTypes = {
  isOpen: boolean;
  setShowModal: (num: number) => void;
};

export default function CreateRoom({ isOpen, setShowModal }: FormPropTypes) {
  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setShowModal(-1)}>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-sky-400 ">Create Room</h2>
          <form className="flex flex-col gap-4" action="">
            <input
              className=" outline-none border border-gray-400 px-2 py-1 rounded-md"
              type="text"
              placeholder="Enter your name"
              name="name"
              id="name"
            />

            <div className="flex justify-between items-center gap-4">
              <input
                className=" outline-none border border-gray-400 px-2 py-1 rounded-md"
                type="text"
                placeholder="Generate room code"
                name="name"
                id="name"
              />
              <div className="flex gap-2">
                <button className="cursor-pointer text-white bg-sky-400 font-bold py-2 px-4 rounded">
                  Generate
                </button>
                <button className="cursor-pointer font-bold py-2 px-4 border border-sky-400 text-sky-400 rounded">
                  Copy
                </button>
              </div>
            </div>

            <button className="cursor-pointer text-white bg-sky-400 font-bold py-2 px-4 rounded">Create Room</button>
          </form>
        </div>
      </Modal>
    </>
  );
}
