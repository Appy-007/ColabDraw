import { useRef, useState } from "react";
import Whiteboard from "../components/WhiteBoard";
import WhiteBoardToolBar from "../components/WhiteBoardToolBar";

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

  console.log("UNDO ArRA",undoWhiteBoardEvents)

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
    if(undoWhiteBoardEvents.length >0){
      const lastundoevent=undoWhiteBoardEvents[undoWhiteBoardEvents.length-1]
      setWhiteBoardEvents((prev)=>{
        return [
          ...prev,
          lastundoevent
        ]
      })

      setUndoWhiteBoardEvents((prev)=>{
        const updatedUndoWhiteBoardEvents=[...prev]
        updatedUndoWhiteBoardEvents.pop()
        return updatedUndoWhiteBoardEvents
      })

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
