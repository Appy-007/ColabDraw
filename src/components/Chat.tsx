export default function Chat(props) {
  const {
    chatBoxRef,
    chatMessages,
    currentUserEmail,
    handleSubmitGuess,
    guessInput,
    setGuessInput,
    gameStatus,
    isDrawer = false,
  } = props;

  return (
    <>
      <div className="bg-white flex flex-col flex-grow rounded-xl shadow-lg border border-gray-200 max-md:h-40 h-96 lg:h-auto">
        <div className="p-2 border-b text-lg font-bold text-gray-700">
          Chats
        </div>

        {/* Messages Display */}
        <div
          ref={chatBoxRef}
          className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar"
        >
          {chatMessages.map((msg, index) => (
            <div key={index} className="text-sm">
              {msg.senderId === "server" ? (
                <span
                  className={`font-semibold ${
                    msg.isCorrectGuess ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  [System] {msg.text}
                </span>
              ) : (
                <>
                  <span
                    className={`font-semibold ${
                      msg.senderId === currentUserEmail
                        ? "text-indigo-600"
                        : "text-gray-800"
                    }`}
                  >
                    {msg.senderName}:
                  </span>
                  <span className="ml-1">{msg.text} </span>
                </>
              )}
            </div>
          ))}
          <p>Chat section is disabled currently..</p>
        </div>

        {/* Guess Input */}
        <form onSubmit={handleSubmitGuess} className="p-4 border-t bg-gray-50">
          <input
            type="text"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            placeholder={
              isDrawer ? "Drawers cannot guess..." : "Type your guess here..."
            }
            className="text-sm w-full p-1 border border-gray-300 rounded-lg
                     focus:ring-indigo-500 focus:border-indigo-500"
            disabled={true}
          />
        </form>
      </div>
    </>
  );
}
