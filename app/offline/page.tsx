export default function OfflinePage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-[#0f0f0f]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#242424] flex items-center justify-center text-3xl">
          📡
        </div>
        <h1 className="text-xl font-bold text-[#f0f0f0]">オフライン</h1>
        <p className="text-sm text-[#888888] max-w-xs">
          ネットワーク接続が必要です。
          <br />
          インターネットに接続して再試行してください。
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-6 py-2.5 bg-amber-500 text-black rounded-2xl text-sm font-semibold active:scale-95 transition-transform"
        >
          再接続
        </button>
      </div>
    </div>
  );
}
