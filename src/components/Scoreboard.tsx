import type { ScoreEntry } from "../pages/Room";

type ScoreboardProps={
  scoreBoard:ScoreEntry[];
  currentDrawer:string;
  currentUserEmail:string;
}

export default function Scoreboard(params:ScoreboardProps) {
  const { scoreBoard, currentDrawer, currentUserEmail } = params;
  return (
    <>
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-3 text-gray-700">Scoreboard</h3>
        <div className="space-y-2">
          {scoreBoard
            .sort((a, b) => b.score - a.score)
            .map((member) => (
              <div
                key={member.userId}
                className={`flex justify-between items-center p-2 rounded-lg ${
                  member.userId === currentUserEmail
                    ? "bg-indigo-100 font-semibold"
                    : "bg-gray-50"
                }`}
              >
                <span className="truncate">
                  {member.username} {member.userId === currentDrawer && "✍️"}
                </span>
                <span className="text-indigo-600 font-extrabold">
                  {member.score}
                </span>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
