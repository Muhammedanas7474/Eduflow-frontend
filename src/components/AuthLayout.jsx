export default function AuthLayout({ title, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-center text-2xl font-semibold text-slate-800">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
