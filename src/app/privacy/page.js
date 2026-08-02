import PublicHeader from '@/components/PublicHeader';
import { CONFIG } from '@/lib/config';

export const metadata = {
  title: `Privacy Policy | ${CONFIG.SITE_NAME}`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full">
        <h1 className="text-3xl md:text-5xl font-balmain font-light text-white mb-8">
          Privacy <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent font-medium">Policy</span>
        </h1>
        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl text-white mt-8 mb-4 font-semibold">1. Introduction</h2>
          <p className="text-zinc-400">
            Welcome to {CONFIG.SITE_NAME}. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights.
          </p>

          <h2 className="text-xl text-white mt-8 mb-4 font-semibold">2. Data We Collect</h2>
          <p className="text-zinc-400">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 text-zinc-400 space-y-2 mt-4">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
            <li><strong>Profile Data:</strong> includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.</li>
          </ul>

          <h2 className="text-xl text-white mt-8 mb-4 font-semibold">3. How We Use Your Data</h2>
          <p className="text-zinc-400">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-zinc-400 space-y-2 mt-4">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2 className="text-xl text-white mt-8 mb-4 font-semibold">4. Data Security</h2>
          <p className="text-zinc-400">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.
          </p>

          <h2 className="text-xl text-white mt-8 mb-4 font-semibold">5. Contact Us</h2>
          <p className="text-zinc-400">
            If you have any questions about this privacy policy or our privacy practices, please contact us via our contact page.
          </p>
        </div>
      </main>
    </div>
  );
}
