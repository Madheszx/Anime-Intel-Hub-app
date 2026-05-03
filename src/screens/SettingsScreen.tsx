import { Palette, Moon, Sun, Monitor, Bell, Shield, Info, Keyboard } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function SettingsScreen() {
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'device', label: 'Device', icon: Monitor },
  ];

  return (
    <div className="pb-24 pt-8 px-6">
      <h1 className="text-2xl font-black text-white mb-8">Settings</h1>

      <div className="flex flex-col gap-8">
        {/* Theme Settings */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-gray-400">
            <Palette size={18} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Appearance</h3>
          </div>
          <div className="bg-obsidian-800 rounded-2xl p-2 border border-white/5 flex gap-1">
            {themeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl transition-all ${
                  theme === opt.id
                    ? 'bg-indigo-500 text-black shadow-lg shadow-indigo-500/20'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <opt.icon size={18} />
                <span className="text-[10px] font-bold">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* General Settings */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-gray-400">
            <Bell size={18} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">General</h3>
          </div>
          <div className="bg-obsidian-800 rounded-2xl border border-white/5 overflow-hidden shadow-sm">
             <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Bell size={16} />
                   </div>
                   <span className="text-white text-sm font-medium">Notifications</span>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-indigo-500' : 'bg-gray-800'}`}
                >
                  <motion.div
                    animate={{ x: notifications ? 26 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
             </div>
             
             <button className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Shield size={16} />
                   </div>
                   <span className="text-white text-sm font-medium">Privacy Policy</span>
                </div>
                <Info size={14} className="text-gray-600" />
             </button>

             <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Keyboard size={16} />
                   </div>
                   <span className="text-white text-sm font-medium">App Shortcuts</span>
                </div>
                <Info size={14} className="text-gray-600" />
             </button>
          </div>
        </section>

        {/* About Info */}
        <div className="mt-4 text-center">
           <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">Anime Intel Hub v1.0.4</p>
           <p className="text-[8px] text-gray-700 tracking-widest">BUILT BY M.S. WITH AS-PRE</p>
        </div>
      </div>
    </div>
  );
}
