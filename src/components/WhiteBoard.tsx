/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import type { WhiteBoardEventType } from "../pages/Room";
import type { Socket } from "socket.io-client";
import type { DefaultEventsMap } from "@socket.io/component-emitter";
import { useNavigate } from "react-router-dom";
import { GameStatus } from "../types.";
import { ToolType } from "../types.";

export type Point = [number, number];

type WhiteBoardPropsType = {
  whiteBoardEvents: WhiteBoardEventType[];
  setWhiteBoardEvents: React.Dispatch<
    React.SetStateAction<WhiteBoardEventType[]>
  >;
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null | undefined;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasctxRef: React.RefObject<CanvasRenderingContext2D | null>;
  tool: string;
  color: string;
  roomId: string | undefined;
  isOwner: boolean;
  gameStatus?: string;
  setGameStatus?: React.Dispatch<React.SetStateAction<string>>;
  handleStartGame: () => void;
};

export default function Whiteboard({
  whiteBoardEvents,
  setWhiteBoardEvents,
  canvasRef,
  canvasctxRef,
  tool,
  color,
  socket,
  roomId,
  isOwner,
  gameStatus,
  handleStartGame,
}: WhiteBoardPropsType) {
  const [enableDrawing, setEnableDrawing] = useState<boolean>(false);

  const currentEventIdRef = useRef<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // console.log("USE EFFECT CALLED");
    const canv = canvasRef.current;
    if (canv) {
      const rect = canv.getBoundingClientRect();

      const scale = window.devicePixelRatio || 1;

      // Set the internal canvas width and height attributes
      canv.width = rect.width * scale;
      canv.height = rect.height * scale;
      const ctx = canv?.getContext("2d");
      ctx?.scale(scale, scale);
      canvasctxRef.current = ctx;
      // console.log("CANVAS CTX", canvasctxRef.current);
    }
  }, [canvasRef, canvasctxRef, gameStatus]);

  const sendBoardEventToSocket = (boardEvent: WhiteBoardEventType) => {
    if (socket && socket.connected && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      // Normalize initial coordinates
      const normalizedEvent = {
        ...boardEvent,
        offsetX: boardEvent.offsetX / rect.width,
        offsetY: boardEvent.offsetY / rect.height,
        currentX: boardEvent.currentX ? boardEvent.currentX / rect.width : undefined,
        currentY: boardEvent.currentY ? boardEvent.currentY / rect.height : undefined,
        path: boardEvent.path?.map(([x, y]) => [x / rect.width, y / rect.height]),
      };
      socket.emit("sendDrawingEvent", { roomId, event: normalizedEvent });
    }
  };

  useLayoutEffect(() => {
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      const canvas = rough.canvas(canvasElement);
      const rect = canvasElement.getBoundingClientRect();
      // console.log("UseLayout called");

      if (whiteBoardEvents?.length > 0) {
        const scale = window.devicePixelRatio || 1;
        // console.log("CTX REF", canvasctxRef.current);
        canvasctxRef.current?.clearRect(
          0,
          0,
          canvasElement.width / scale!,
          canvasElement.height / scale!
        );
        whiteBoardEvents.forEach((boardEvent: WhiteBoardEventType) => {
          const strokeOptions = {
            strokeWidth: 2.0,
            stroke: boardEvent?.stroke,
            roughness: 0,
          };

          const denormalizeX = (val: number) => val <= 1.1 ? val * rect.width : val;
          const denormalizeY = (val: number) => val <= 1.1 ? val * rect.height : val;
          if (boardEvent.type === ToolType.PENCIL) {
            const denormalizedPath =boardEvent?.path &&  boardEvent?.path?.length >0 &&  boardEvent.path.map(([x, y]: any) => [denormalizeX(x), denormalizeY(y)]);
            canvas.linearPath(denormalizedPath as Point[], strokeOptions);
            // canvas.linearPath(boardEvent?.path as Point[], strokeOptions);
          } else if (boardEvent.type === ToolType.LINE) {
            canvas.line(
              denormalizeX(boardEvent.offsetX),
              denormalizeY(boardEvent.offsetY),
              denormalizeX(boardEvent.currentX !),
              denormalizeY(boardEvent.currentY !),
              strokeOptions
            );
          } else {
            const startX = denormalizeX(boardEvent.offsetX);
            const startY = denormalizeY(boardEvent.offsetY);
            const endX = denormalizeX(boardEvent.currentX !);
            const endY = denormalizeY(boardEvent.currentY !);

            // FIX: Normalize coordinates to get consistent top-left corner and positive width/height
            const x = Math.min(startX, endX);
            const y = Math.min(startY, endY);
            const width = Math.abs(endX - startX);
            const height = Math.abs(endY - startY);
            canvas.rectangle(x, y, width, height, strokeOptions);
          }
        });
      }
    }
  }, [whiteBoardEvents, canvasRef, canvasctxRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isOwner) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const id =
      (crypto as any).randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setEnableDrawing(true);
    let newBoardEvent: WhiteBoardEventType;
    if (tool == ToolType.PENCIL) {
      newBoardEvent = {
        id,
        type: ToolType.PENCIL,
        offsetX: offsetX,
        offsetY: offsetY,
        path: [[offsetX, offsetY]],
        stroke: color,
      };
    } else if (tool == ToolType.LINE) {
      newBoardEvent = {
        id,
        type: ToolType.LINE,
        offsetX: offsetX,
        offsetY: offsetY,
        stroke: color,
        currentX: offsetX,
        currentY: offsetY,
      };
    } else {
      newBoardEvent = {
        id,
        type: ToolType.RECTANGLE,
        offsetX: offsetX,
        offsetY: offsetY,
        stroke: color,
        currentX: offsetX,
        currentY: offsetY,
      };
    }
    currentEventIdRef.current = id;
    sendBoardEventToSocket(newBoardEvent);

    setWhiteBoardEvents((prev: WhiteBoardEventType[]) => [
      ...prev,
      newBoardEvent,
    ]);

  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableDrawing || !isOwner || !canvasRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const rect =  canvasRef.current.getBoundingClientRect();

    setWhiteBoardEvents((prevWhiteBoardEvents: WhiteBoardEventType[]) => {
      const id = currentEventIdRef.current;
      if (!id) return prevWhiteBoardEvents;
      const idx = prevWhiteBoardEvents.findIndex((event) => event.id === id);
      
      if (idx === -1) return prevWhiteBoardEvents;

      const ev = prevWhiteBoardEvents[idx];
      if (ev.type === ToolType.PENCIL) {
        const updatedPath = [...(ev.path ?? []), [offsetX, offsetY]];
        const updatedEvent = { ...ev, path: updatedPath };
        if (isOwner && socket && socket.connected) {
          socket.emit("sendDrawingUpdate", {
            roomId,
            id,
            type: "pencil_event",
            point: [offsetX/rect.width, offsetY/rect.height],
          });
        }
        return prevWhiteBoardEvents.map((be, i) =>
          i === idx ? updatedEvent : be
        );
      } else {
        const updatedEvent = { ...ev, currentX: offsetX, currentY: offsetY };
        if (isOwner && socket && socket.connected) {
          socket.emit("sendDrawingUpdate", {
            roomId,
            id,
            type: "shape_event",
            currentX: offsetX / rect.width,
            currentY: offsetY / rect.height,
            shapeType: ev.type,
          });
        }
        return prevWhiteBoardEvents.map((be, i) =>
          i === idx ? updatedEvent : be
        );
      }
    });
  };

  const handleMouseUp = () => {
    if (!isOwner) return;
    currentEventIdRef.current = null;
    setEnableDrawing(false);
  };

  return (
    <>
      {gameStatus != GameStatus.PLAYING ? (
        gameStatus === GameStatus.FINISHED ? (
          <div
            className="max-md:w-full w-8/12 my-2 sm:my-10 border max-md:h-2/5 h-screen 
                flex items-center justify-center  
                border-gray-800 bg-white/20 backdrop-blur-md 
                  rounded-xl shadow-lg p-2"
          >
            <div className="flex-col gap-10 text-center">
              <p className="text-2xl font-bold text-green-500">
                Game ended !!{" "}
              </p>
              <p className="text-xs sm:text-sm">
                Browse back to the home page to start a new game
              </p>
              <button
                className="rounded-lg cursor-pointer bg-blue-600 px-2 py-1 sm:p-2 mt-5 text-white text-xs sm:text-md"
                onClick={() => navigate("/home")}
              >
                Go to Home
              </button>
            </div>
          </div>
        ) : (
          <div
            className="max-md:w-full w-8/12  my-2 sm:my-10 border max-md:h-60 h-screen 
                flex items-center justify-center  
                border-gray-800 bg-white/20 backdrop-blur-md 
                  rounded-xl shadow-lg"
          >
            {isOwner && (
              <button
                onClick={handleStartGame}
                className="cursor-pointer border border-gray-300 p-2 rounded-md max-md:text-xs"
              >
                Start Game
              </button>
            )}
          </div>
        )
      ) : (
        <canvas
          ref={canvasRef}
          className={`max-md:w-full w-8/12 my-2 sm:my-10 border max-md:h-60 h-screen  border-gray-800 bg-white touch-none`}
          onPointerUp={isOwner ? handleMouseUp : () => {}}
          onPointerMove={isOwner ? handleMouseMove : () => {}}
          onPointerDown={isOwner ? handleMouseDown : () => {}}
          onPointerCancel={isOwner ? handleMouseUp : () => {}}
          onPointerLeave={isOwner ? handleMouseUp : () => {}}
        ></canvas>
      )}
    </>
  );
}
