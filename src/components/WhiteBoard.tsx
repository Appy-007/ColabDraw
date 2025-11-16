import { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import type { WhiteBoardEventType } from "../pages/Room";
import type { Socket } from "socket.io-client";
import type { DefaultEventsMap } from "@socket.io/component-emitter";

export type Point = [number, number];

type WhiteBoardPropsType = {
  whiteBoardEvents: WhiteBoardEventType[];
  setUndoWhiteBoardEvents: React.Dispatch<
    React.SetStateAction<WhiteBoardEventType[]>
  >;
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
};

export default function Whiteboard({
  whiteBoardEvents,
  setUndoWhiteBoardEvents,
  setWhiteBoardEvents,
  canvasRef,
  canvasctxRef,
  tool,
  color,
  socket,
  roomId,
  isOwner,
}: WhiteBoardPropsType) {
  const [enableDrawing, setEnableDrawing] = useState<boolean>(false);

  const currentEventIdRef = useRef<string | null>(null);

  // console.log("TOOLS", tool, color);

  useEffect(() => {
    const canv = canvasRef.current;
    if (canv) {
      const rect = canv.getBoundingClientRect();
      const scale= window.devicePixelRatio || 1;


      // Set the internal canvas width and height attributes
      canv.width = rect.width * scale;
      canv.height = rect.height * scale;
      const ctx = canv?.getContext("2d");
      ctx?.scale(scale,scale);
      canvasctxRef.current = ctx;
    }
  }, [canvasRef, canvasctxRef]);

  // useEffect(()=>{
  //   if(isOwner && !enableDrawing && whiteBoardEvents && whiteBoardEvents.length >0){
  //     console.log("UseEffect called")
  //     const lastwhiteBoardEvent=whiteBoardEvents[whiteBoardEvents.length -1]
  //     sendBoardEventToSocket(lastwhiteBoardEvent)
  //   }

  // }, [enableDrawing, whiteBoardEvents])

  const sendBoardEventToSocket = (boardEvent: WhiteBoardEventType) => {
    if (socket && socket.connected) {
      console.log("SEND EVENT FROM CLIENT", boardEvent);
      socket.emit("sendDrawingEvent", { roomId, event: boardEvent });
      console.log("Executed");
    }
  };

  useLayoutEffect(() => {
    const canvas = rough.canvas(canvasRef.current!);
    console.log("UseLayout called");

    if (whiteBoardEvents?.length > 0) {
      canvasctxRef.current?.clearRect(
        0,
        0,
        canvasRef.current.width!,
        canvasRef.current.height!
      );
      whiteBoardEvents.forEach((boardEvent: WhiteBoardEventType) => {
        if (boardEvent.type === "pencil") {
          canvas.linearPath(boardEvent.path as Point[], {
            strokeWidth: 0.5,
            stroke: boardEvent.stroke,
            roughness: 0,
          });
        } else if (boardEvent.type === "line") {
          canvas.line(
            boardEvent.offsetX,
            boardEvent.offsetY,
            boardEvent.currentX!,
            boardEvent.currentY!,
            { strokeWidth: 0.5, stroke: boardEvent.stroke, roughness: 0 }
          );
        } else {
          canvas.rectangle(
            boardEvent.offsetX,
            boardEvent.offsetY,
            boardEvent.currentX! - boardEvent.offsetX,
            boardEvent.currentY! - boardEvent.offsetY,
            { strokeWidth: 0.5, stroke: boardEvent.stroke, roughness: 0 }
          );
        }
      });
    }
  }, [whiteBoardEvents, canvasRef, canvasctxRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const { offsetX, offsetY } = e.nativeEvent;
    // console.log("MOUSE DOWN", offsetX, offsetY);
    const id =
      (crypto as any).randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setEnableDrawing(true);
    let newBoardEvent: WhiteBoardEventType;
    if (tool == "pencil") {
      newBoardEvent = {
        id,
        type: "pencil",
        offsetX: offsetX,
        offsetY: offsetY,
        path: [[offsetX, offsetY]],
        stroke: color,
      };
    } else if (tool == "line") {
      newBoardEvent = {
        id,
        type: "line",
        offsetX: offsetX,
        offsetY: offsetY,
        stroke: color,
        currentX: offsetX,
        currentY: offsetY,
      };
    } else {
      newBoardEvent = {
        id,
        type: "rectangle",
        offsetX: offsetX,
        offsetY: offsetY,
        stroke: color,
        currentX: offsetX,
        currentY: offsetY,
      };
    }
    currentEventIdRef.current = id;

    if (isOwner) {
      // 1. Send the initial event creation
      sendBoardEventToSocket(newBoardEvent);
    }

    setWhiteBoardEvents((prev: WhiteBoardEventType[]) => [
      ...prev,
      newBoardEvent,
    ]);

    // setWhiteBoardEvents((prev: WhiteBoardEventType[]) => {
    //   if (tool === "pencil") {
    //     return [
    //       ...prev,
    //       {
    //         type: tool,
    //         offsetX: offsetX,
    //         offsetY: offsetY,
    //         path: [[offsetX, offsetY]],
    //         stroke: color,
    //       },
    //     ];
    //   } else if (tool == "rectangle") {
    //     return [
    //       ...prev,
    //       {
    //         type: tool,
    //         offsetX: offsetX,
    //         offsetY: offsetY,
    //         stroke: color,
    //         currentX: offsetX,
    //         currentY: offsetY,
    //       },
    //     ];
    //   } else {
    //     return [
    //       ...prev,
    //       {
    //         type: tool,
    //         offsetX: offsetX,
    //         offsetY: offsetY,
    //         stroke: color,
    //         currentX: offsetX,
    //         currentY: offsetY,
    //       },
    //     ];
    //   }
    // });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    // console.log("MOUSE MOVING", offsetX, offsetY);

    setWhiteBoardEvents((prevWhiteBoardEvents: WhiteBoardEventType[]) => {
      const id = currentEventIdRef.current;
      if (!id) return prevWhiteBoardEvents;
      const idx = prevWhiteBoardEvents.findIndex((event) => event.id === id);

      if (idx === -1) {
        // should not happen normally; but be defensive: create placeholder
        const placeholder: WhiteBoardEventType = {
          id,
          type: tool === "pencil" ? "pencil" : tool === "rectangle" ? "rectangle" : "line",
          offsetX,
          offsetY,
          stroke: color,
          path: tool === "pencil" ? [[offsetX, offsetY]] : undefined,
          currentX: offsetX,
          currentY: offsetY,
        };
        return [...prevWhiteBoardEvents, placeholder];
      }


      const lastWhiteBoardEventIndex = prevWhiteBoardEvents.length - 1;
      if (lastWhiteBoardEventIndex < 0) {
        return prevWhiteBoardEvents;
      }
      const ev = prevWhiteBoardEvents[idx];
      if (ev.type === "pencil") {
        const updatedPath = [...(ev.path ?? []), [offsetX, offsetY]];
        const updatedEvent = { ...ev, path: updatedPath };
        // send update to server
        if (isOwner && socket && socket.connected) {
          socket.emit("sendDrawingUpdate", {
            roomId,
            id,
            type: "pencil_event",
            point: [offsetX, offsetY],
          });
        }
        return prevWhiteBoardEvents.map((be, i) => (i === idx ? updatedEvent : be));
      } else {
        const updatedEvent = { ...ev, currentX: offsetX, currentY: offsetY };
        if (isOwner && socket && socket.connected) {
          socket.emit("sendDrawingUpdate", {
            roomId,
            id,
            type: "shape_event",
            currentX: offsetX,
            currentY: offsetY,
            shapeType: ev.type, // optional helpful field
          });
        }
        return prevWhiteBoardEvents.map((be, i) => (i === idx ? updatedEvent : be));
      }
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // const { offsetX, offsetY } = e.nativeEvent;
    // console.log("MOUSE UP", offsetX, offsetY);
    currentEventIdRef.current = null;
    setUndoWhiteBoardEvents([]);
    setEnableDrawing(false);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full my-10 border h-screen  border-gray-800 bg-white"
        onMouseUp={isOwner ? handleMouseUp : () => {}}
        onMouseMove={isOwner ? handleMouseMove : () => {}}
        onMouseDown={isOwner ? handleMouseDown : () => {}}
      ></canvas>
    </>
  );
}
