import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

export default function UserLayout({ children, taskModal }) {
  if (CONFIG.USE_NEW_UI) {
    // New UI Layout (Sidebar based)
    return (
      <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-orange-500 selection:text-white flex">
        <Sidebar />
        <div className="flex-1 md:pl-64 flex flex-col min-h-screen overflow-x-hidden">
          <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
          <Footer />
          {taskModal}
        </div>
      </div>
    );
  }

  // Legacy UI Layout (Top-nav based)
  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-orange-500 selection:text-white flex flex-col">
      <div className="sticky top-0 z-50 bg-black max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <Header />
      </div>
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {children}
      </div>
      <Footer />
      {taskModal}
    </div>
  );
}
