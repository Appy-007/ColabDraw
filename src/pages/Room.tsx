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
import { ToolType, GameStatus } from "../types.";
import Timer from "../components/Timer";

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

  const [whiteBoardEvents, setWhiteBoardEvents] = useState<
    WhiteBoardEventType[]
  >([]);

  const [gameStatus, setGameStatus] = useState<string>(GameStatus.IDLE);
  const [currentWordHint, setCurrentWordHint] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [scoreboard, setScoredboard] = useState<ScoreEntry[]>([
    { userId: "", username: "", score: 0 },
  ]);
  const [forceTimerOff,setForceTimerOff]=useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [currentOwnerEmail, setCurrentOwnerEmail] = useState<string>("");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<ChatMessage>();

  const [guessInput, setGuessInput] = useState("");
  const [enableGuessInput, setEnableGuessInput] = useState(true);

  const [tool, setTool] = useState<string>(ToolType.PENCIL);
  const [color, setColor] = useState<string>("#000000");

  const [socket, setSocket] = useState<Socket | null | undefined>();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasctxRef = useRef(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const localStorageRef = useRef(null);

  const navigate = useNavigate();

  // console.log("CANVAS", canvasRef.current, canvasctxRef.current);

  useEffect(() => {
    const getDataFromLocalStorage = localStorage.getItem("scribbleDraw-data");
    try {
      if (!getDataFromLocalStorage) {
        throw new Error("no data found");
      }
      const parsedData = JSON.parse(getDataFromLocalStorage);
      if (!parsedData?.user?.username) {
        throw new Error("invalid data structure in localStorage");
      }
      localStorageRef.current = parsedData;
    } catch (error) {
      toast.error("Failed to fetch data from localStorage...try relogin");
      console.error("storage Error:", error?.message);
      navigate("/home");
    }
  }, [navigate]);

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
        user = localStorageRef.current?.user?.username;
        useremail = localStorageRef.current?.user?.email;
        setCurrentUser(user);
        setCurrentUserEmail(useremail);

        if (!room) {
          toast.error("Error occured in joining room");
          throw new Error("Error occured in joining room");
        }

        const roomData = room.data;
        const isUserOwner = roomData.ownerEmailId === useremail;
        setScoredboard(roomData?.scoreBoard || []);
        setIsOwner(isUserOwner);
        setCurrentOwnerEmail(roomData.ownerEmailId);
        newSocket = getAuthenticatedSocket();

        if (!newSocket) throw new Error("Socket not initialized");
        setSocket(newSocket);
        const emitSocketEvent = (
          s: Socket<DefaultEventsMap, DefaultEventsMap>,
          user: string
        ) => {
          if (roomData?.joinedUsers && roomData.ownerEmailId === useremail) {
            s.emit("createRoom", { roomId: roomData.roomId });
          } else {
            s.emit("joinRoom", { roomId: roomData.roomId, user: user });
          }
        };
        if (newSocket && newSocket.connected) {
          console.log(
            "Socket already connected. Emitting createRoom/joinRoom..."
          );
          emitSocketEvent(newSocket, user);
        } else {
          newSocket.once("connect", () => {
            console.log("Connected to server. Emitting createRoom/joinRoom...");
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
          newSocket.emit("leaveRoom", { roomId: roomId });
        }
        newSocket.disconnect();
      }
    };
  }, [roomId, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.on("roomCreated", (payload) => {
      toast.success(payload.message);
    });

    socket.on("roomJoined", (payload) => {
      toast.success(payload.message);
    });

    socket.on("roomLeft", (payload) => {
      toast.success(payload.message);
      navigate('/home');
    });

    socket.on("userJoined", (payload) => {
      toast.success(` ${payload.message}`);
      fetchScoreBoard();
    });

    socket.on("userLeft", (payload) => {
      toast.success(payload.message);
    });

    socket.on("receiveDrawingUpdate", (payload) => {
      setWhiteBoardEvents((prev) => {
        const id = payload.id;
        const eventIndex = prev.findIndex((event) => event?.id === id);
        if (eventIndex === -1) {
          const placeholder: WhiteBoardEventType = {
            id: payload.id,
            type:
              payload.type === "pencil_event"
                ? "pencil"
                : payload.type === "shape_event"
                ? payload.shapeType
                : "pencil",
            offsetX: payload?.offsetX ?? 0,
            offsetY: payload?.offsetY ?? 0,
            stroke: payload?.stroke ?? "#000000",
            path:
              payload.type === "pencil_event"
                ? ([payload?.point].filter(Boolean) as any)
                : undefined,
            currentX: payload?.currentX,
            currentY: payload?.currentY,
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
      setWhiteBoardEvents((prev) => {
        const eventExists = prev.some(
          (event) => event?.id === payload.event.id
        );
        if (eventExists) return prev;
        return [...prev, payload.event];
      });
    });

    socket.on("receiveClearCanvas", ()=>{
      handleClearCanvas();
    })

    socket.on("receiveStartGameForDrawer", (payload) => {
      setGameStatus(payload.mode);
      setCurrentWord(payload.word);
      setCurrentWordHint(payload.maskedWord);
    });

    socket.on("receiveStartGame", (payload) => {
      handleClearCanvas();
      setGameStatus(payload.mode);
      setCurrentWordHint(payload.maskedWord);
      setEnableGuessInput(true);
      setGuessInput("");
      setForceTimerOff(false);
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

    socket.on('receiveRoundEnd',(payload)=>{
      if(payload?.message && !isOwner){
        setForceTimerOff(true);
      }
    })

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

    return () => {
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("roomLeft");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("receiveDrawingUpdate");
      socket.off("receiveDrawingEvent");
      socket.off("receiveClearCanvas");
      socket.off("receiveStartGame");
      socket.off("receiveStartGameForDrawer");
      socket.off("correctGuess");
      socket.off("wrongGuess");
      socket.off("updateScoreBoard");
      socket.off("receiveRoundEnd");
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

    const scale = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canv.width / scale, canv.height / scale);

    if(isOwner){
      if(socket && socket.connected){
        socket.emit("clearCanvas",{roomId: roomId})
      }
    }

    setWhiteBoardEvents([]);
  };

  const handleLeaveRoom = () => {
    if (socket && socket.connected) {
      socket.emit("leaveRoom", { roomId: roomId });
    }
  };

  const handleStartGame = () => {
    if (socket && socket.connected) {
      socket.emit("startGame", { roomId: roomId, user: currentUser });
    }
  };

  const fetchScoreBoard = async () => {
    try {
      const response = await roomApi.fetchRoomScoreBoard({ roomId: roomId! });
      setScoredboard(response.data.data);
    } catch (error) {
      console.log("fetchScoreBoard error",error);
    }
  };

  const checkGuessedInput = () => {
    if (socket && socket.connected) {
      socket.emit("checkWord", {
        roomId,
        userId: localStorageRef.current?.user?.email,
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
        <div className="px-20 py-5">
          {isOwner && (
            <WhiteBoardToolBar
              tool={tool}
              setTool={setTool}
              color={color}
              setColor={setColor}
              onClearCanvasClick={handleClearCanvas}
              onLeaveRoom={handleLeaveRoom}
            />
          )}

          <div className="flex justify-end pt-2">
            {gameStatus === GameStatus.PLAYING && (
              <Timer
                gameStatus={gameStatus}
                setGameStatus={setGameStatus}
                onClearCanvasClick={handleClearCanvas}
                isOwner={isOwner}
                onRoundEnd={handleRoundEnd}
                forceTimerOff={forceTimerOff}
              />
            )}
          </div>

          {gameStatus === GameStatus.PLAYING && (
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
                currentUserEmail={currentUserEmail}
                currentOwnerEmail={currentOwnerEmail}
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
            />
          </div>
        </div>
      </div>
    </>
  );
}
