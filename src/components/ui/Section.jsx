export function Section({ title, right, children }) {
  return (
    <div className="rounded-2xl shadow-lg p-6 bg-white border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}