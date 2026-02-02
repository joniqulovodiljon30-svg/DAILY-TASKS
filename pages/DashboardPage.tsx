
import React, { useState, useEffect, useMemo } from 'react';
import { User, Task, TaskStatus, TaskPriority, EnergyLevel, UserMood, TaskCategory } from '../types';
import { storageService } from '../services/storage';
import { aiService } from '../services/ai';
import { 
  Plus, LogOut, Settings, CheckCircle2, Circle, Trash2, Sparkles, 
  BarChart3, BrainCircuit, CalendarDays, Check, Flag, Edit3, X, 
  Zap, LayoutGrid, Maximize2, Battery, Clock, Flame, Trophy,
  Coffee, Rocket, Smile, Target, ChevronRight, Activity, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC<{ user: User; onLogout: () => void }> = ({ user: initialUser, onLogout }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [newEnergy, setNewEnergy] = useState<EnergyLevel>(EnergyLevel.MEDIUM);
  const [newTime, setNewTime] = useState('15m');
  const [newCategory, setNewCategory] = useState<TaskCategory>(TaskCategory.PERSONAL);

  const [currentMood, setCurrentMood] = useState<UserMood | null>(null);
  const [zenMode, setZenMode] = useState(false);
  const [aiInsight, setAiInsight] = useState<{ suggestion: string; splitTask?: string } | null>(null);
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [showXPPopup, setShowXPPopup] = useState<{ xp: number; id: string } | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loaded = storageService.getTasks(user.id);
    setTasks(loaded);
    const updated = storageService.updateUserStats(user.id, 0);
    if (updated) setUser(updated);
    
    // Procrastination Check
    aiService.analyzeProcrastination(loaded).then(setAiInsight);
  }, [user.id]);

  const sortedTasks = useMemo(() => {
    const pOrder = { [TaskPriority.CRITICAL]: 0, [TaskPriority.HIGH]: 1, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 3 };
    return [...tasks].sort((a, b) => {
      if (a.status !== b.status) return a.status === TaskStatus.PENDING ? -1 : 1;
      return pOrder[a.priority] - pOrder[b.priority];
    });
  }, [tasks]);

  const handleAddTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskText.trim()) return;
    const t = storageService.addTask(user.id, newTaskText, newPriority, newEnergy, newTime, newCategory);
    setTasks([t, ...tasks]);
    setNewTaskText('');
  };

  const handleToggle = (id: string) => {
    const res = storageService.toggleTask(user.id, id);
    if (res) {
      setTasks(tasks.map(t => t.id === id ? res.task : t));
      if (res.task.status === TaskStatus.COMPLETED) {
        setShowXPPopup({ xp: res.xpGained, id: Math.random().toString() });
        const updated = storageService.updateUserStats(user.id, res.xpGained, true);
        if (updated) setUser(updated);
        setTimeout(() => setShowXPPopup(null), 2000);
      }
    }
  };

  const startAiPlan = async () => {
    if (!currentMood) return;
    setIsPlanning(true);
    const plan = await aiService.getSmartDailyPlan(tasks, currentMood);
    setAiPlan(plan);
    setIsPlanning(false);
  };

  const progress = Math.round((tasks.filter(t => t.status === TaskStatus.COMPLETED).length / (tasks.length || 1)) * 100);

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${zenMode ? 'bg-slate-950 p-0 overflow-hidden' : 'bg-slate-950 text-slate-100'}`}>
      
      {/* XP Toast Notification */}
      {showXPPopup && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-2xl animate-bounce shadow-blue-500/50 flex items-center gap-2">
          <Zap className="w-5 h-5 fill-current" /> +{showXPPopup.xp} XP!
        </div>
      )}

      {/* Mood Check-in Overlay */}
      {!currentMood && !zenMode && (
        <div className="fixed inset-0 z-[80] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-10 animate-scale-in">
            <h2 className="text-4xl font-black text-white">Bugun holatingiz?</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { mood: UserMood.TIRED, label: 'Charchoq', icon: Coffee, color: 'text-amber-500' },
                { mood: UserMood.NORMAL, label: 'Normal', icon: Smile, color: 'text-blue-500' },
                { mood: UserMood.MOTIVATED, label: "A'lo", icon: Rocket, color: 'text-emerald-500' }
              ].map(m => (
                <button key={m.mood} onClick={() => setCurrentMood(m.mood)} className="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] hover:bg-slate-800 transition-all flex flex-col items-center gap-3">
                  <m.icon className={`w-12 h-12 ${m.color}`} />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Focus Mode Immersive Overlay */}
      {zenMode && (
        <div className="fixed inset-0 z-[90] bg-slate-950 flex flex-col items-center justify-center p-10 animate-fade-in">
          <button onClick={() => setZenMode(false)} className="absolute top-10 right-10 p-4 bg-slate-900 rounded-full text-slate-500 hover:text-white transition-all"><X /></button>
          {tasks.find(t => t.status === TaskStatus.PENDING) ? (
            <div className="w-full max-w-2xl text-center space-y-16">
              <div className="relative inline-block">
                <div className="w-64 h-64 rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <Target className="w-20 h-20 text-blue-500 animate-pulse" />
                </div>
                <svg className="absolute top-0 left-0 w-64 h-64 -rotate-90">
                  <circle cx="128" cy="128" r="124" fill="none" stroke="currentColor" strokeWidth="6" className="text-blue-600 neon-glow-blue" strokeDasharray={778} strokeDashoffset={778 * (1 - progress/100)} />
                </svg>
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-black tracking-tight">{tasks.find(t => t.status === TaskStatus.PENDING)?.text}</h1>
                <p className="text-slate-500 text-xl font-medium uppercase tracking-widest">Hozirgi vazifa</p>
              </div>
              <button onClick={() => handleToggle(tasks.find(t => t.status === TaskStatus.PENDING)!.id)} className="px-12 py-6 bg-blue-600 text-white text-2xl font-black rounded-[2rem] shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all">Bajarildi!</button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto"><Check className="w-12 h-12 text-emerald-500" /></div>
              <h1 className="text-4xl font-bold">Hammasi bajarildi!</h1>
              <p className="text-slate-500">Endi dam olish vaqti.</p>
            </div>
          )}
        </div>
      )}

      {/* Main UI */}
      {!zenMode && (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col lg:flex-row gap-10">
          
          {/* Main Workspace */}
          <div className="flex-1 space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black text-white">Focus <span className="text-blue-500">Zen</span></h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full"><Flame className="w-3 h-3 fill-current" /> {user.streak} kun</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full"><Trophy className="w-3 h-3" /> Lvl {user.level}</span>
                </div>
              </div>
              <button onClick={() => setZenMode(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl font-bold hover:border-blue-500 transition-all">
                <Maximize2 className="w-4 h-4" /> Fokus
              </button>
            </div>

            {/* Quick Input Section */}
            <div className="space-y-4">
              <form onSubmit={handleAddTask} className="relative">
                <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Bugungi reja..." className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl py-6 px-8 text-xl focus:outline-none focus:border-blue-600 transition-all shadow-xl" />
                <button type="submit" className="absolute right-4 top-4 bottom-4 aspect-square bg-blue-600 rounded-2xl flex items-center justify-center text-white hover:bg-blue-500 transition-all shadow-lg"><Plus className="w-8 h-8" /></button>
              </form>
              <div className="flex flex-wrap gap-2 px-2">
                <select value={newPriority} onChange={e => setNewPriority(e.target.value as TaskPriority)} className="bg-slate-900 border border-slate-800 text-[10px] font-bold uppercase rounded-xl px-3 py-2 text-slate-400">
                  <option value={TaskPriority.LOW}>Past</option>
                  <option value={TaskPriority.MEDIUM}>O'rta</option>
                  <option value={TaskPriority.HIGH}>Yuqori</option>
                  <option value={TaskPriority.CRITICAL}>Kritik 🔥</option>
                </select>
                <select value={newEnergy} onChange={e => setNewEnergy(e.target.value as EnergyLevel)} className="bg-slate-900 border border-slate-800 text-[10px] font-bold uppercase rounded-xl px-3 py-2 text-slate-400">
                  <option value={EnergyLevel.LOW}>Past Energiya 🔋</option>
                  <option value={EnergyLevel.MEDIUM}>O'rta Energiya 🔋🔋</option>
                  <option value={EnergyLevel.HIGH}>Yuqori Energiya 🔋🔋🔋</option>
                </select>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value as TaskCategory)} className="bg-slate-900 border border-slate-800 text-[10px] font-bold uppercase rounded-xl px-3 py-2 text-slate-400">
                  <option value={TaskCategory.PERSONAL}>Personal</option>
                  <option value={TaskCategory.WORK}>Work</option>
                  <option value={TaskCategory.STUDY}>Study</option>
                  <option value={TaskCategory.HEALTH}>Health</option>
                </select>
              </div>
            </div>

            {/* AI Insights Bar */}
            {aiInsight && (
              <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-[2rem] flex items-start gap-4">
                <BrainCircuit className="w-8 h-8 text-blue-500 shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-200">{aiInsight.suggestion}</p>
                  {aiInsight.splitTask && <pre className="mt-3 p-3 bg-slate-950/50 rounded-xl text-xs text-slate-400 font-mono whitespace-pre-wrap">{aiInsight.splitTask}</pre>}
                </div>
              </div>
            )}

            {/* Tasks Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Vazifalar</h3>
                <button onClick={startAiPlan} className="text-xs font-bold text-blue-400 flex items-center gap-1 hover:underline">
                  <Sparkles className="w-3 h-3" /> AI Plan
                </button>
              </div>
              
              {sortedTasks.map(task => (
                <div key={task.id} className={`group bg-slate-900/40 border border-slate-800/50 p-5 rounded-[2rem] flex items-center justify-between hover:border-slate-700 transition-all ${task.status === TaskStatus.COMPLETED ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex items-center gap-5">
                    <button onClick={() => handleToggle(task.id)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${task.status === TaskStatus.COMPLETED ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 hover:border-blue-500'}`}>
                      {task.status === TaskStatus.COMPLETED && <Check className="w-5 h-5 text-white" />}
                    </button>
                    <div>
                      <span className={`text-lg font-medium block ${task.status === TaskStatus.COMPLETED ? 'line-through text-slate-500' : 'text-slate-100'}`}>{task.text}</span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${task.priority === TaskPriority.CRITICAL ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-400'}`}>{task.priority}</span>
                        <span className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1"><Battery className="w-2.5 h-2.5" /> {task.energyLevel}</span>
                        <span className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1"><LayoutGrid className="w-2.5 h-2.5" /> {task.category}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { storageService.deleteTask(user.id, task.id); setTasks(tasks.filter(t => t.id !== task.id)); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Analytics */}
          <aside className="lg:w-80 space-y-8">
            {/* Progression Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Progression</span>
                <span className="text-[10px] font-bold bg-blue-600/10 text-blue-400 px-2 py-1 rounded-lg">Level {user.level}</span>
              </div>
              <div className="text-4xl font-black mb-1">{user.xp} <span className="text-sm font-bold text-slate-500">XP</span></div>
              <div className="w-full h-2 bg-slate-950 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-blue-500 neon-glow-blue transition-all duration-1000" style={{ width: `${(user.xp % (user.level * 100)) / (user.level * 100) * 100}%` }}></div>
              </div>
            </div>

            {/* Streak & Motivation */}
            <div className="bg-gradient-to-br from-orange-600 to-red-600 p-6 rounded-[2.5rem] text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"><Flame className="w-6 h-6 fill-current" /></div>
                <div>
                  <div className="text-2xl font-black">{user.streak} Kun</div>
                  <div className="text-[10px] font-bold opacity-70 uppercase">Daily Streak</div>
                </div>
              </div>
              <p className="text-xs font-medium leading-relaxed opacity-90 italic">"G'alabalar kichik odatlardan boshlanadi. Davom eting!"</p>
            </div>

            {/* Simple Activity Map */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem]">
              <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2"><Activity className="w-3 h-3" /> Heatmap</h4>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className={`aspect-square rounded-[4px] ${i % 3 === 0 ? 'bg-blue-500/50' : i % 5 === 0 ? 'bg-blue-500/80' : 'bg-slate-950'}`}></div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-[9px] font-bold text-slate-600">
                <span>Last 4 Weeks</span>
                <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Details</span>
              </div>
            </div>

            <button onClick={() => storageService.exportData(user.id)} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-[2rem] text-xs font-black uppercase text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-all">Export JSON Backup</button>
            <button onClick={onLogout} className="w-full py-4 bg-slate-900/50 text-slate-500 font-bold text-sm rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all">Tizimdan chiqish</button>
          </aside>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default DashboardPage;
