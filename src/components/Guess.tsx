import type React from "react";

export type GuessProps = {
  isOwner: boolean;
  guessInput: string;
  setGuessInput: React.Dispatch<React.SetStateAction<string>>;
  currentWord: string;
  currentWordHint: string;
  checkGuessedInput?: () => void;
  enableGuessInput: boolean;
};

export default function Guess(props: GuessProps) {
  const {
    isOwner,
    guessInput,
    setGuessInput,
    currentWord,
    currentWordHint,
    checkGuessedInput,
    enableGuessInput
  } = props;
  return (
    <>
      <div className="flex flex-col items-center p-2 bg-gray-100 rounded-xl shadow-2xl space-y-2 max-w-lg mx-auto">
        {/* 1. Word/Hint Display Card */}
        <div
          className={`p-2 rounded-lg w-full text-center ${
            isOwner
              ? "bg-indigo-600 text-white"
              : "bg-white border-2 border-dashed border-indigo-400 text-gray-800"
          } transition duration-300`}
        >
          <p className="text-sm font-semibold uppercase opacity-80 mb-1">
            {isOwner ? "Your Word" : "Your Hint"}
          </p>
          <div className="text-xl font-extrabold tracking-widest">
            {isOwner ? currentWord : currentWordHint}
          </div>
        </div>

        {/* 2. Guesser Input Section (Only for non-owner) */}
        {!isOwner && (
          <div className="flex flex-col w-full space-y-3 p-2 bg-gray-50 rounded-lg shadow-inner">
            <label
              htmlFor="guessInput"
              className="text-sm font-medium text-gray-600"
            >
              Enter Your Guess:
            </label>
            <div className="flex gap-2">
              <input
                id="guessInput"
                type="text"
                placeholder="Type your word here..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-md transition duration-150 ease-in-out
          "
                disabled={!enableGuessInput}
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
              />
              <button
                disabled={!enableGuessInput}
                onClick={checkGuessedInput}
                className="px-6 py-2 bg-indigo-500 text-white font-bold rounded-lg  shadow-md hover:bg-indigo-600  focus:outline-none focus:ring-4 focus:ring-indigo-300  active:bg-indigo-700 transition duration-150 ease-in-out cursor-pointer
          "
              >
                Check
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
