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
  currentX?:number,
  currentY?:number,
};



export default function Room() {
  const [whiteBoardEvents, setWhiteBoardEvents] = useState<
    WhiteBoardEventType[]
  >([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasctxRef = useRef(null);

   const ToolType={
    PENCIL:'pencil',
    LINE:'line',
    RECTANGLE:'rectangle'
  }
  const [tool,setTool]=useState<string>(ToolType.PENCIL)
  const [color,setColor]=useState<string>('#000000')
  return (
    <>
      <div className="bg-stone-100">
        <h1 className="font-bold text-4xl px-20 pb-4 py-6">Your Whiteboard</h1>
        <div className="px-20">
          <WhiteBoardToolBar tool={tool} setTool={setTool} color={color} setColor={setColor} />
          <Whiteboard
            whiteBoardEvents={whiteBoardEvents}
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
