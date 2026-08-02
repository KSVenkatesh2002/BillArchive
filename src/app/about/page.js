import PublicHeader from '@/components/PublicHeader';
import { CONFIG } from '@/lib/config';
import { Layers, Shield, Zap } from 'lucide-react';

export const metadata = {
  title: `About Us | ${CONFIG.SITE_NAME}`,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full space-y-16">
        
        <div className="text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-balmain font-light text-white">
            About <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent font-medium">{CONFIG.SITE_NAME}</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            {CONFIG.DESCRIPTION}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-orange-950/40 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 mx-auto mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold mb-2">Lightning Fast</h3>
            <p className="text-sm text-zinc-400">Built for power users who need to log time and manage complex tasks without friction.</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-orange-950/40 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 mx-auto mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold mb-2">Deep Integrations</h3>
            <p className="text-sm text-zinc-400">Seamlessly syncs with ClickUp and other enterprise tools to keep your data connected.</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-orange-950/40 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 mx-auto mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold mb-2">Secure & Private</h3>
            <p className="text-sm text-zinc-400">Your organizational data and billing metrics are heavily encrypted and isolated.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
