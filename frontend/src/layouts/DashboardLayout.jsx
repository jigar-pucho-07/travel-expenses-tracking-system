import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { motion } from 'framer-motion';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      {/* Global Powered By Badge */}
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(139,92,246,0.15)] border border-white/50">
          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Powered By</span>
          <img src="https://cdn.prod.website-files.com/690ec911550adb97c4a56495/69399fa4c6253325791cd9ce_pucho%20logo.webp"
               alt="Pucho.ai" className="h-4 w-auto object-contain" />
        </motion.div>
      </div>
    </div>
  );
}