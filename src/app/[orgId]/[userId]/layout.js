import Header from '@/components/Header';

export const dynamic = 'force-dynamic';

export default function UserLayout({ children, taskModal }) {
  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-orange-500 selection:text-white flex flex-col">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Header />
      </div>
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {children}
      </div>
      {taskModal}
    </div>
  );
}
