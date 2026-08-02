import PublicHeader from '@/components/PublicHeader';
import { CONFIG } from '@/lib/config';

export const metadata = {
  title: `Terms of Service | ${CONFIG.SITE_NAME}`,
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full">
        <h1 className="text-3xl md:text-5xl font-balmain font-light text-white mb-8">
          Terms of <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent font-medium">Service</span>
        </h1>
        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-xl text-white mt-8 mb-4 font-semibold">1. Agreement to Terms</h2>
          <p className="text-zinc-400">
            By viewing or using {CONFIG.SITE_NAME}, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
          </p>

          <h2 className="text-xl text-white mt-8 mb-4 font-semibold">2. Use License</h2>
          <p className="text-zinc-400">
            Permission is granted to temporarily download one copy of the materials (information or software) on {CONFIG.SITE_NAME} for personal, non-commercial transitory viewing only.
          </p>

          <h2 className="text-xl text-white mt-8 mb-4 font-semibold">3. Disclaimer</h2>
          <p className="text-zinc-400">
            The materials on {CONFIG.SITE_NAME} are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2 className="text-xl text-white mt-8 mb-4 font-semibold">4. Limitations</h2>
          <p className="text-zinc-400">
            In no event shall {CONFIG.SITE_NAME} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
          </p>
        </div>
      </main>
    </div>
  );
}
