import { useEffect, useLayoutEffect, useState } from "react";
import rough from "roughjs";
import type { WhiteBoardEventType } from "../pages/Room";

export type Point = [number, number];

type WhiteBoardPropsType = {
  whiteBoardEvents: WhiteBoardEventType[];
  setWhiteBoardEvents: React.Dispatch<
    React.SetStateAction<WhiteBoardEventType[]>
  >;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasctxRef: React.RefObject<CanvasRenderingContext2D | null>;
  tool: string;
  color: string;
};

export default function Whiteboard({
  whiteBoardEvents,
  setWhiteBoardEvents,
  canvasRef,
  canvasctxRef,
  tool,
  color,
}: WhiteBoardPropsType) {
  const [enableDrawing, setEnableDrawing] = useState<boolean>(false);
  console.log("TOOLS", tool, color);

  useEffect(() => {
    const canv = canvasRef.current;
    if (canv) {
      const rect = canv.getBoundingClientRect();

      // Set the internal canvas width and height attributes
      canv.width = rect.width;
      canv.height = rect.height;
      const ctx = canv.getContext("2d");
      canvasctxRef.current = ctx;
    }
  }, [canvasRef, canvasctxRef]);

  useLayoutEffect(() => {
    const canvas = rough.canvas(canvasRef.current!);
    console.log("Function called");

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
          });
        } else if (boardEvent.type === "line") {
          canvas.line(
            boardEvent.offsetX,
            boardEvent.offsetY,
            boardEvent.currentX!,
            boardEvent.currentY!,
            { strokeWidth: 0.5, stroke: boardEvent.stroke }
          );
        } else {
          canvas.rectangle(
            boardEvent.offsetX,
            boardEvent.offsetY,
            boardEvent.currentX!,
            boardEvent.currentY!,
            { strokeWidth: 0.5, stroke: boardEvent.stroke }
          );
        }
      });
    }
  }, [whiteBoardEvents, canvasRef, canvasctxRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const { offsetX, offsetY } = e.nativeEvent;
    console.log("MOUSE DOWN", offsetX, offsetY);
    setEnableDrawing(true);

    setWhiteBoardEvents((prev: WhiteBoardEventType[]) => {
      if (tool === "pencil") {
        return [
          ...prev,
          {
            type: tool,
            offsetX: offsetX,
            offsetY: offsetY,
            path: [[offsetX, offsetY]],
            stroke: color,
          },
        ];
      } else if (tool == "rectangle") {
        return [
          ...prev,
          {
            type: tool,
            offsetX: offsetX,
            offsetY: offsetY,
            stroke: color,
            currentX: offsetX,
            currentY: offsetY,
          },
        ];
      } else {
        return [
          ...prev,
          {
            type: tool,
            offsetX: offsetX,
            offsetY: offsetY,
            stroke: color,
            currentX: offsetX,
            currentY: offsetY,
          },
        ];
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (enableDrawing) {
      const { offsetX, offsetY } = e.nativeEvent;
      console.log("E", e.nativeEvent);
      console.log("MOUSE MOVING", offsetX, offsetY);
      setWhiteBoardEvents((prevWhiteBoardEvents: WhiteBoardEventType[]) => {
        const lastWhiteBoardEventIndex = prevWhiteBoardEvents.length - 1;
        if (lastWhiteBoardEventIndex < 0) {
          return prevWhiteBoardEvents;
        }

        const lastwhiteBoardEvent =
          prevWhiteBoardEvents[lastWhiteBoardEventIndex];
        if (tool === "pencil") {
          const { path = [] } = lastwhiteBoardEvent;
          const updatedPath = [...path, [offsetX, offsetY]];
          return prevWhiteBoardEvents.map(
            (boardevent: WhiteBoardEventType, index: number) => {
              if (index === prevWhiteBoardEvents.length - 1) {
                return {
                  ...boardevent,
                  path: updatedPath,
                };
              } else {
                return boardevent;
              }
            }
          );
        } else if (tool === "rectangle") {
          return prevWhiteBoardEvents.map(
            (boardevent: WhiteBoardEventType, index: number) => {
              if (index === prevWhiteBoardEvents.length - 1) {
                return {
                  ...boardevent,
                  currentX: offsetX - boardevent.offsetX,
                  currentY: offsetY - boardevent.offsetY,
                };
              } else {
                return boardevent;
              }
            }
          );
        } else {
          return prevWhiteBoardEvents.map(
            (boardevent: WhiteBoardEventType, index: number) => {
              if (index === prevWhiteBoardEvents.length - 1) {
                return {
                  ...boardevent,
                  currentX: offsetX,
                  currentY: offsetY,
                };
              } else {
                return boardevent;
              }
            }
          );
        }
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const { offsetX, offsetY } = e.nativeEvent;
    console.log("MOUSE UP", offsetX, offsetY);
    setEnableDrawing(false);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full my-10 border h-screen  border-gray-800 bg-white"
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
      ></canvas>
    </>
  );
}
