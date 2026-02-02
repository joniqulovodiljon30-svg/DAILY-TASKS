
import React, { useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';
import { LogIn, UserPlus, ShieldCheck, Zap } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Iltimos, barcha maydonlarni to‘ldiring.');
      return;
    }

    const users = storageService.getUsers();
    
    if (isLogin) {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Username yoki parol noto‘g‘ri.');
      }
    } else {
      const exists = users.some(u => u.username === username);
      if (exists) {
        setError('Bu username allaqachon mavjud.');
        return;
      }
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        password,
        joinedAt: new Date().toISOString(),
        xp: 0,
        level: 1,
        streak: 0,
        bestStreak: 0,
        totalTasksCompleted: 0
      };
      storageService.saveUser(newUser);
      onLogin(newUser);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600 neon-glow-blue mb-6">
            <Zap className="text-white w-10 h-10 fill-current" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-2 italic">ZENAI</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Productivity Re-imagined</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700"
                placeholder="Username"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700"
                placeholder="Parol"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-4 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-blue-600 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              {isLogin ? 'Tizimga kirish' : 'Hisob ochish'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-slate-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest transition-all">
              {isLogin ? "Ro'yxatdan o'tish" : "Tizimga kirish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
