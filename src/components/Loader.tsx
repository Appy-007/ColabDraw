export default function Loader({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        <div className="mb-4 text-4xl animate-bounce">✏️</div>

        {/* The Animated Drawing Line */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-indigo-500 animate-sketch-line"></div>
        </div>

        <p className="mt-4 font-mono text-sm font-bold tracking-widest text-white uppercase">
          Sketching your room...
        </p>
      </div>

    </div>
  );
}
