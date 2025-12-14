/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import Whiteboard from "../components/WhiteBoard";
import WhiteBoardToolBar from "../components/WhiteBoardToolBar";
import type { Socket } from "socket.io-client";
import getAuthenticatedSocket from "../utils/socket";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { roomApi } from "../api";
import type { DefaultEventsMap } from "@socket.io/component-emitter";
import Scoreboard from "../components/Scoreboard";
import Chat from "../components/Chat";
import Guess from "../components/Guess";

export type PathType = number[];

export type WhiteBoardEventType = {
  id: string;
  type: string;
  offsetX: number;
  offsetY: number;
  path?: PathType[];
  stroke: string;
  currentX?: number;
  currentY?: number;
};

export type ScoreEntry = {
  userId: string;
  username: string;
  score: number;
};

type ChatMessage = {
  senderId: string;
  senderName: string;
  text: string;
  isCorrectGuess: boolean;
};

export default function Room() {
  const params = useParams();
  const roomId = params.roomId;
  const [totaMembers, setTotalMembers] = useState(1);
  const [whiteBoardEvents, setWhiteBoardEvents] = useState<
    WhiteBoardEventType[]
  >([]);
  const [gameStatus, setGameStatus] = useState<
    "idle" | "playing" | "round_end" | "finished"
  >("idle");
  const [currentDrawer, setcurrentDrawer] = useState<string>("");
  const [currentWordHint, setCurrentWordHint] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [currentTimer, setCurrentTimer] = useState<number>();
  const [scoreboard, setScoredboard] = useState<ScoreEntry[]>([
    { userId: "", username: "", score: 0 },
  ]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<ChatMessage>();
  const [guessInput, setGuessInput] = useState("");
  const [enableGuessInput, setEnableGuessInput] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasctxRef = useRef(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const ToolType = {
    PENCIL: "pencil",
    LINE: "line",
    RECTANGLE: "rectangle",
  };
  const [tool, setTool] = useState<string>(ToolType.PENCIL);
  const [color, setColor] = useState<string>("#000000");
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const [socket, setSocket] = useState<Socket | null | undefined>();
  const navigate = useNavigate();

  const getDataFromLocalStorage = localStorage.getItem("data") || "";
  const parsedData = JSON.parse(getDataFromLocalStorage);
  if (!parsedData && !parsedData.user.username) {
    throw new Error(
      "Error occured in parsing data from localStorage..try login again"
    );
  }

  console.log("CANVAS", canvasRef.current, canvasctxRef.current);

  useEffect(() => {
    let newSocket:
      | Socket<DefaultEventsMap, DefaultEventsMap>
      | null
      | undefined = null;

    let user: string;
    let useremail: string;

    async function initializeRoom() {
      if (!roomId) {
        return;
      }

      try {
        const room = await checkIfRoomExits(roomId);

        user = parsedData.user.username;
        useremail = parsedData.user.email;
        setcurrentDrawer(user);

        if (!room) {
          toast.error("Error occured in joining room");
          throw new Error("Error occured in joining room");
        }

        const roomData = room.data[0];
        console.log("ROOM", roomData);
        // console.log("JOINED USERS", roomData?.joinedUsers);
        const isUserOwner = roomData.ownerEmailId === useremail;
        setCurrentUserEmail(roomData.ownerEmailId);
        setScoredboard(roomData?.scoreBoard || []);
        setIsOwner(isUserOwner);
        newSocket = getAuthenticatedSocket();

        if (!newSocket) throw new Error("Socket not initialized");

        setSocket(newSocket);
        const emitSocketEvent = (
          s: Socket<DefaultEventsMap, DefaultEventsMap>,
          user: string
        ) => {
          if (roomData?.joinedUsers && roomData.joinedUsers.length > 1) {
            s.emit("joinRoom", { roomId: roomData.roomId, user: user });
          } else {
            s.emit("createRoom", { roomId: roomData.roomId });
          }
        };
        if (newSocket && newSocket.connected) {
          console.log("Socket already connected. Emitting createRoom...");
          emitSocketEvent(newSocket, user);
        } else {
          newSocket.once("connect", () => {
            console.log("Connected to server. Emitting createRoom...");
            if (newSocket) {
              console.log("New Socket initialized");
              emitSocketEvent(newSocket, user);
            }
          });
        }
      } catch (error) {
        console.error(error);
        navigate("/home");
      }
    }
    initializeRoom();

    return () => {
      if (newSocket && newSocket.connected) {
        console.log("Cleaning up socket connection.");
        if (user && roomId) {
          // Send the specific room ID the user is leaving
          newSocket.emit("leaveRoom", { roomId: roomId }, (response: any) => {
            console.log("leaveRoom response:", response);
            // Optionally check for response success here if needed, but the important part is the emission.
          });
        }
        newSocket.disconnect();
      }
    };
  }, [roomId, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.on("roomCreated", (payload) => {
      // console.log(`Room created! ID: ${payload.roomId}`);
      toast.success(payload.message);
      setTotalMembers(payload.count);
    });

    socket.on("roomJoined", (payload) => {
      // console.log("Room joined");
      toast.success(payload.message);
      setTotalMembers(payload.count);
    });

    socket.on("roomLeft", (payload) => {
      // console.log(payload.message);
      toast.success(payload.message);
    });

    socket.on("userJoined", (payload) => {
      // console.log(`New user joined: ${payload.username}`);
      toast.success(` ${payload.message}`);
      fetchScoreBoard();
      setTotalMembers(payload.count);
    });

    socket.on("userLeft", (payload) => {
      // console.log("An user left the room", payload);
      toast.success(payload.message);
      setTotalMembers(payload.count);
    });

    socket.on("receiveDrawingUpdate", (payload) => {
      setWhiteBoardEvents((prev) => {
        console.log("FUNCTION EXECUTION RECEIVE DRAWING UPDATE");
        const id = payload.id;
        const eventIndex = prev.findIndex((event) => event?.id === id);
        if (eventIndex === -1) {
          const placeholder: WhiteBoardEventType = {
            id: payload.id,
            type:
              payload.type === "pencil_event"
                ? "pencil"
                : payload.type === "shape_event"
                ? payload.shapeType || "line"
                : "pencil",
            offsetX: payload.offsetX ?? 0,
            offsetY: payload.offsetY ?? 0,
            stroke: payload.stroke ?? "#000000",
            path:
              payload.type === "pencil_event"
                ? ([payload.point].filter(Boolean) as any)
                : undefined,
            currentX: payload.currentX,
            currentY: payload.currentY,
          };
          return [...prev, placeholder];
        }

        return prev.map((event) => {
          if (event.id != payload.id) return event;
          if (payload.type === "pencil_event") {
            const newPath = [...(event.path ?? []), payload.point];
            return {
              ...event,
              path: newPath,
            };
          } else if (payload.type === "shape_event") {
            return {
              ...event,
              currentX: payload.currentX,
              currentY: payload.currentY,
            };
          } else {
            return event;
          }
        });
      });
    });

    socket.on("receiveDrawingEvent", (payload) => {
      console.log("Drawing event from socket", payload.event);
      setWhiteBoardEvents((prev) => {
        const eventExists = prev.some(
          (event) => event?.id === payload.event.id
        );
        if (eventExists) return prev;
        return [...prev, payload.event];
      });
    });

    socket.on("receiveStartGameForDrawer", (payload) => {
      console.log("Recieved receiveStartGameForDrawer event", payload);
      setGameStatus(payload.mode);
      setCurrentWord(payload.word);
      setCurrentWordHint(payload.maskedWord);
      setCurrentTimer(30);
    });

    socket.on("receiveStartGame", (payload) => {
      console.log("Recieved receiveStartGame event", payload);
      handleClearCanvas();
      setGameStatus(payload.mode);
      setCurrentWordHint(payload.maskedWord);
      setEnableGuessInput(true);
      setGuessInput("");
      setCurrentTimer(30);
    });

    socket.on("wrongGuess", (payload) => {
      toast.error(payload.message);
    });

    socket.on("correctGuess", (payload) => {
      toast.info(payload.message);
      setEnableGuessInput(false);
    });

    socket.on("updateScoreBoard", (payload) => {
      if (payload?.scoreBoard) {
        setScoredboard(payload.scoreBoard);
      }
    });

    socket.on("endGame", (payload) => {
      if (payload) {
        setGameStatus(payload.mode);
        toast.info(payload.message);
      }
    });

    socket.on("roomError", (payload) => {
      console.log(`ERROR: ${payload.message}`);
      toast.error(payload.message);
    });

    // 💡 Listener for drawing events (as per previous discussion)
    // socket.on('drawing', (data) => { /* Redraw logic */ });

    return () => {
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("roomLeft");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("receiveDrawingUpdate");
      socket.off("receiveDrawingEvent");
      socket.off("receiveStartGame");
      socket.off("receiveStartGameForDrawer");
      socket.off("correctGuess");
      socket.off("wrongGuess");
      socket.off("updateScoreBoard");
      socket.off("endGame");
      socket.off("roomError");
    };
  }, [socket]);

  async function checkIfRoomExits(roomId: string) {
    const data = {
      roomId: roomId,
    };
    const roomDataRes = await roomApi.checkRoom(data);
    return roomDataRes;
  }

  const handleClearCanvas = () => {
    console.log("CLEAR CANVAS EVENT CALLED");
    const canv = canvasRef.current;
    const ctx = canvasctxRef.current as
      | CanvasRenderingContext2D
      | null
      | undefined;

    if (!canv || !ctx) {
      console.error("Canvas or context is not initialized.");
      return;
    }

    ctx.fillStyle = "white";

    const scale = window.devicePixelRatio || 1; // FIX 2: Clear using logical (unscaled) dimensions

    ctx.clearRect(
      0,
      0,
      canv.width / scale, // Logical Width
      canv.height / scale // Logical Height
    );

    setWhiteBoardEvents([]);
  };

  const handleLeaveRoom = () => {
    if (socket && socket.connected) {
      socket.emit("leaveRoom", { roomId: roomId }, (response: any) => {
        console.log("leaveRoom response:", response);
      });
    }
  };

  const handleStartGame = () => {
    if (socket && socket.connected) {
      socket.emit("startGame", { roomId: roomId, user: currentDrawer });
    }
  };

  const fetchScoreBoard = async () => {
    try {
      const response = await roomApi.fetchRoomScoreBoard({ roomId: roomId! });
      setScoredboard(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const checkGuessedInput = () => {
    if (socket && socket.connected) {
      socket.emit("checkWord", {
        roomId,
        userId: parsedData.user.email,
        word: guessInput,
      });
    }
  };

  const handleRoundEnd = () => {
    if (socket && socket.connected) {
      socket.emit("roundEnd", {
        roomId,
      });
    }
  };

  return (
    <>
      <div className="bg-stone-100">
        <p className="font-bold text-lg px-20 pb-2 py-2 text-gray-700">
          Current users {totaMembers}
        </p>
        <div className="px-20">
          {isOwner && (
            <WhiteBoardToolBar
              isOwner={isOwner}
              tool={tool}
              setTool={setTool}
              color={color}
              setColor={setColor}
              onClearCanvasClick={handleClearCanvas}
              onRoundEnd={handleRoundEnd}
              onLeaveRoom={handleLeaveRoom}
              gameStatus={gameStatus}
              setGameStatus={setGameStatus}
            />
          )}

          {gameStatus === "playing" && (
            <Guess
              isOwner={isOwner}
              guessInput={guessInput}
              setGuessInput={setGuessInput}
              currentWord={currentWord}
              currentWordHint={currentWordHint}
              checkGuessedInput={checkGuessedInput}
              enableGuessInput={enableGuessInput}
            />
          )}
          <div className="flex max-md:flex-col-reverse flex-wrap max-md:items-center items-start gap-4 flex-1 ">
            <div className="flex max-md:flex-row flex-col my-10 gap-6 max-md:w-full w-3/12">
              <Scoreboard
                scoreBoard={scoreboard}
                currentDrawer={currentDrawer}
                currentUserEmail={currentUserEmail}
              />
              <Chat
                chatBoxRef={chatBoxRef}
                chatMessages={chatMessages}
                guessInput={chatInput}
                setGuessInput={setChatInput}
                gameStatus={gameStatus}
                currentUserEmail={currentUserEmail}
              />
            </div>
            <Whiteboard
              whiteBoardEvents={whiteBoardEvents}
              setWhiteBoardEvents={setWhiteBoardEvents}
              socket={socket}
              canvasRef={canvasRef}
              canvasctxRef={canvasctxRef}
              tool={tool}
              color={color}
              roomId={roomId}
              isOwner={isOwner}
              gameStatus={gameStatus}
              setGameStatus={setGameStatus}
              handleStartGame={handleStartGame}
              currentWord={currentWord}
              currentWordHint={currentWordHint}
            />
          </div>
        </div>
      </div>
    </>
  );
}
