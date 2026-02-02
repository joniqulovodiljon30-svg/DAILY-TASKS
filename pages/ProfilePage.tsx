
import React, { useState } from 'react';
import { User } from '../types';
import { ChevronLeft, User as UserIcon, LogOut, Check, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfilePageProps {
  user: User;
  onUpdate: (username: string) => void;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdate, onLogout }) => {
  const [username, setUsername] = useState(user.username);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  const handleSave = () => {
    onUpdate(username);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-10 group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Orqaga qaytish
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center neon-glow-blue shadow-xl">
            <UserIcon className="w-12 h-12 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Profil sozlamalari</h1>
            <p className="text-slate-500">Shaxsiy ma'lumotlaringizni boshqaring</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest ml-1">Foydalanuvchi nomi</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-600 transition-all text-xl"
              />
              {isSaved && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center gap-1 animate-fade-in">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">Saqlandi</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              O‘zgarishlarni saqlash
            </button>
            <button
              onClick={onLogout}
              className="px-8 bg-slate-800 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 border border-slate-700 text-slate-400 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Chiqish
            </button>
          </div>
        </div>

        <div className="mt-12 pt-10 border-t border-slate-800 flex justify-between items-center text-xs text-slate-600 font-medium">
          <div className="flex flex-col gap-1">
            <span>A’zo bo‘lgan sana:</span>
            <span className="text-slate-400">{new Date(user.joinedAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span>Tizim versiyasi:</span>
            <span className="text-slate-400">ZenAI v2.0-Alpha</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
