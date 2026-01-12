/* eslint-disable @typescript-eslint/no-explicit-any */
import { ToolType} from "../types.";

export default function WhiteBoardToolBar({
  tool,
  setTool,
  color,
  setColor,
  onClearCanvasClick,
  onLeaveRoom,
}: any) {

  return (
    <>
      <div className="flex max-sm:flex-col items-start sm:items-center justify-between text-sm max-sm:gap-2">
        <div className="flex items-center justify-baseline gap-2">
          <div className="flex gap-0.5 sm:gap-2 items-center justify-start">
          <div>
            <label htmlFor="pencil" className="pr-1 max-sm:text-xs">
              Pencil
            </label>
            <input
              type="radio"
              checked={tool === ToolType.PENCIL}
              value={ToolType.PENCIL}
              name="tool"
              onChange={(e) => setTool(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="line" className="pr-1 max-sm:text-xs">
              Line
            </label>
            <input
              type="radio"
              checked={tool === ToolType.LINE}
              value={ToolType.LINE}
              name="tool"
              onChange={(e) => setTool(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="rectangle" className="pr-1 max-sm:text-xs">
              Rectangle
            </label>
            <input
              type="radio"
              checked={tool === ToolType.RECTANGLE}
              value={ToolType.RECTANGLE}
              name="tool"
              onChange={(e) => setTool(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <label htmlFor="color" className="max-sm:text-xs">Select color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        </div>
        <div className="flex gap-2">
          <button
            className="max-sm:text-xs px-2 py-1 rounded-md border border-blue-400 text-red-500 cursor-pointer"
            onClick={onClearCanvasClick}
          >
            Clear Board
          </button>
          <button
            className="max-sm:text-xs px-2 py-1 rounded-md border bg-red-500 text-white cursor-pointer"
            onClick={onLeaveRoom}
          >
            Leave Room
          </button>
        </div>
      </div>
    </>
  );
}
