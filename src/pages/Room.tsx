import { useEffect, useRef, useState } from "react";
import Whiteboard from "../components/WhiteBoard";
import WhiteBoardToolBar from "../components/WhiteBoardToolBar";
import type { Socket } from "socket.io-client";
import getAuthenticatedSocket from "../utils/socket";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { roomApi } from "../api";
import type { DefaultEventsMap } from "@socket.io/component-emitter";

export type PathType = number[];

export type WhiteBoardEventType = {
  type: string;
  offsetX: number;
  offsetY: number;
  path?: PathType[];
  stroke: string;
  currentX?: number;
  currentY?: number;
};

export default function Room() {
  const params = useParams();
  const roomId = params.roomId;
  console.log("ROOMID", roomId);
  const [whiteBoardEvents, setWhiteBoardEvents] = useState<
    WhiteBoardEventType[]
  >([]);
  const [undoWhiteBoardEvents, setUndoWhiteBoardEvents] = useState<
    WhiteBoardEventType[]
  >([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasctxRef = useRef(null);

  const ToolType = {
    PENCIL: "pencil",
    LINE: "line",
    RECTANGLE: "rectangle",
  };
  const [tool, setTool] = useState<string>(ToolType.PENCIL);
  const [color, setColor] = useState<string>("#000000");

  const [socket, setSocket] = useState<Socket | null | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    let newSocket:
      | Socket<DefaultEventsMap, DefaultEventsMap>
      | null
      | undefined = null;
    async function initializeRoom() {
      if (!roomId) {
        return;
      }

      try {
        const room = await checkIfRoomExits(roomId);
        const getDataFromLocalStorage = localStorage.getItem("data") || "";
        const parsedData = JSON.parse(getDataFromLocalStorage);
        if (!parsedData && !parsedData.user.username) {
          throw new Error(
            "Error occured in parsing data from localStorage..try login again"
          );
        }
        const user = parsedData.user.username;

        if (!room) {
          toast.error("Error occured in joining room");
          throw new Error("Error occured in joining room");
        }

        const roomData = room.data[0];
        console.log("ROOM", roomData);
        console.log("JOINED USERS", roomData?.joinedUsers);
        newSocket = getAuthenticatedSocket();

        if (!newSocket) throw new Error("Socket not initialized");

        setSocket(newSocket);
        const emitSocketEvent=(s:Socket<DefaultEventsMap, DefaultEventsMap>,user:string)=>{
          if (roomData?.joinedUsers && roomData.joinedUsers.length > 1) {
            s.emit(
              "joinRoom",
              { roomId: roomData.roomId, user: user },
              (response:any) => {
                console.log(response);
              }
            );
          } else {
            s.emit(
              "createRoom",
              { roomId: roomData.roomId },
              (response:any) => {
                console.log(response);
              }
            );
          }

        }
        if (newSocket && newSocket.connected) {
          console.log("Socket already connected. Emitting createRoom...");
          emitSocketEvent(newSocket,user)
          
        } else {
          newSocket.once("connect", () => {
            console.log("Connected to server. Emitting createRoom...");
            if (newSocket) {
              console.log("New Socket initialized");
              emitSocketEvent(newSocket,user)
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
        newSocket.disconnect(); 
      }
    };
  }, [roomId, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.on("roomCreated", (payload) => {
      console.log(`Room created! ID: ${payload.roomId}`);
      toast.success(`Room created`);
    });

    socket.on("userJoined", (payload) => {
      console.log(`New user joined: ${payload.username}`);
      toast.success(`New user joined: ${payload.username}`);
    });

    socket.on("roomError", (payload) => {
      console.log(`ERROR: ${payload.message}`);
    });

    socket.on('userLeft',(payload)=>{
      console.log("An user left the room",payload)
      toast.success("An user left the room")

    })

    // 💡 Listener for drawing events (as per previous discussion)
    // socket.on('drawing', (data) => { /* Redraw logic */ });

    return () => {
      socket.off("roomCreated");
      socket.off("userJoined");
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
    const ctx = canv?.getContext("2d");
    ctx.fillStyle = "white";
    canvasctxRef.current.clearRect(
      0,
      0,
      canvasRef.current?.width,
      canvasRef.current?.height
    );
    setWhiteBoardEvents([]);
  };

  console.log("UNDO ArRA", undoWhiteBoardEvents);

  const handleUndoEvents = () => {
    console.log("Undo clicked");
    if (whiteBoardEvents.length > 0 && undoWhiteBoardEvents.length < 5) {
      const lastBoardEvent = whiteBoardEvents[whiteBoardEvents.length - 1];
      undoWhiteBoardEvents.push(lastBoardEvent);
      if (whiteBoardEvents.length == 1) {
        handleClearCanvas();
      } else {
        setWhiteBoardEvents((prev) => {
          const lastBoardEventIndex = prev.length - 1;
          return prev.filter((boardevent, index) => {
            if (index !== lastBoardEventIndex) {
              return boardevent;
            }
          });
        });
      }
    }
  };

  const handleRedoEvents = () => {
    console.log("Redo clicked");
    if (undoWhiteBoardEvents.length > 0) {
      const lastundoevent =
        undoWhiteBoardEvents[undoWhiteBoardEvents.length - 1];
      setWhiteBoardEvents((prev) => {
        return [...prev, lastundoevent];
      });

      setUndoWhiteBoardEvents((prev) => {
        const updatedUndoWhiteBoardEvents = [...prev];
        updatedUndoWhiteBoardEvents.pop();
        return updatedUndoWhiteBoardEvents;
      });
    }
  };

  return (
    <>
      <div className="bg-stone-100">
        <h1 className="font-bold text-4xl px-20 pb-4 py-6">Your Whiteboard</h1>
        <div className="px-20">
          <WhiteBoardToolBar
            tool={tool}
            setTool={setTool}
            color={color}
            setColor={setColor}
            onClearCanvasClick={handleClearCanvas}
            onUndoClick={handleUndoEvents}
            onRedoClick={handleRedoEvents}
          />
          <Whiteboard
            whiteBoardEvents={whiteBoardEvents}
            setUndoWhiteBoardEvents={setUndoWhiteBoardEvents}
            setWhiteBoardEvents={setWhiteBoardEvents}
            canvasRef={canvasRef}
            canvasctxRef={canvasctxRef}
            tool={tool}
            color={color}
          />
        </div>
      </div>
    </>
  );
}
