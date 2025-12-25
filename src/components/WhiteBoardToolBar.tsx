/* eslint-disable @typescript-eslint/no-explicit-any */

import Timer from "./Timer";
import { ToolType,GameStatus } from "../types.";

export default function WhiteBoardToolBar({
  tool,
  setTool,
  color,
  setColor,
  onClearCanvasClick,
  onRoundEnd,
  onLeaveRoom,
  gameStatus,
  setGameStatus,
  isOwner
}: any) {

  return (
    <>
      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-2 items-center justify-start">
          <div>
            <label htmlFor="pencil" className="pr-1">
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
            <label htmlFor="line" className="pr-1">
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
            <label htmlFor="rectangle" className="pr-1">
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
          <label htmlFor="color">Select color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        <div>
          {gameStatus === GameStatus.PLAYING && (
            <Timer
              gameStatus={gameStatus}
              setGameStatus={setGameStatus}
              onClearCanvasClick={onClearCanvasClick}
              isOwner={isOwner}
              onRoundEnd={onRoundEnd}
            />
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 rounded-md border border-blue-400 text-red-500 cursor-pointer"
            onClick={onClearCanvasClick}
          >
            Clear Board
          </button>
          <button
            className="px-2 py-1 rounded-md border bg-red-500 text-white cursor-pointer"
            onClick={onLeaveRoom}
          >
            Leave Room
          </button>
        </div>
      </div>
    </>
  );
}
