'use client';

export default function AuthModal({ show, onClose, mode, setMode, form, onChange, onSubmit, error }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Access secure multi-user features
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-805 rounded-xl text-rose-350 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs text-zinc-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Mercer"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-zinc-300 font-semibold mb-1">Username</label>
            <input
              type="text"
              placeholder="e.g. alex_dev"
              value={form.username}
              onChange={(e) => onChange({ ...form, username: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-300 font-semibold mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => onChange({ ...form, password: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            {mode === 'login' ? 'Login to Dashboard' : 'Register Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <span className="text-zinc-400">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </span>{' '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              onChange({ username: '', password: '', name: '' });
            }}
            className="text-indigo-400 hover:underline font-semibold"
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
