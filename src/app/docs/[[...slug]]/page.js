import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { BookOpen, FileText, ArrowLeft, ChevronRight, Code, ShieldCheck, Layers } from 'lucide-react';

const DOCS_NAV = [
  {
    category: 'Architecture',
    items: [
      { title: 'Overview', slug: 'architecture/overview' },
    ]
  },
  {
    category: 'Development',
    items: [
      { title: 'Project Structure', slug: 'development/project-structure' },
      { title: 'Coding Standards', slug: 'development/coding-standards' },
    ]
  },
  {
    category: 'Features',
    items: [
      { title: 'Task Management', slug: 'features/task-management' },
      { title: 'Projects & Organizations', slug: 'features/projects-and-organizations' },
      { title: 'Time Logging & Reports', slug: 'features/time-logging-and-reports' },
    ]
  },
  {
    category: 'API & Reference',
    items: [
      { title: 'API Endpoints', slug: 'api/endpoints' },
      { title: 'Testing Strategy', slug: 'testing/testing-strategy' },
      { title: 'Deployment Guide', slug: 'deployment/deployment' },
    ]
  }
];

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slugArr = resolvedParams?.slug || ['architecture', 'overview'];
  const titleStr = slugArr.join(' / ').replace(/-/g, ' ');
  return {
    title: `Documentation - ${titleStr}`,
    description: 'System Documentation & API Reference for Bill Archive Platform'
  };
}

export default async function DocsViewerPage({ params }) {
  const resolvedParams = await params;
  const slugArr = resolvedParams?.slug || ['architecture', 'overview'];
  const docPath = slugArr.join('/');
  
  const fullPath = path.join(process.cwd(), 'docs', `${docPath}.md`);
  
  let content = '';
  try {
    if (fs.existsSync(fullPath)) {
      content = fs.readFileSync(fullPath, 'utf8');
    } else {
      content = `# 404 - Document Not Found\n\nThe requested documentation page \`${docPath}\` was not found.`;
    }
  } catch (err) {
    content = `# Error Loading Document\n\nFailed to read \`${docPath}.md\`: ${err.message}`;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-base tracking-wide text-white">Bill Archive Documentation</span>
          </div>
        </div>
        <div className="text-xs font-mono text-zinc-500">
          v1.0.0 Pro Edition
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-zinc-800/80 p-6 shrink-0 hidden md:block space-y-6 bg-zinc-950/30">
          {DOCS_NAV.map((cat) => (
            <div key={cat.category} className="space-y-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 px-2">
                {cat.category}
              </h4>
              <ul className="space-y-1">
                {cat.items.map((item) => {
                  const isActive = docPath === item.slug;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                      >
                        <span>{item.title}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        {/* Markdown Content Area */}
        <main className="flex-1 p-6 md:p-10 max-w-4xl overflow-y-auto">
          <article className="prose prose-invert max-w-none space-y-6">
            <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl mb-8 flex items-center gap-3">
              <Layers className="w-5 h-5 text-orange-400" />
              <span className="text-xs font-mono text-zinc-400">
                Viewing: <strong className="text-zinc-200">docs/{docPath}.md</strong>
              </span>
            </div>

            <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-300 leading-relaxed bg-zinc-950 border border-zinc-800 p-6 rounded-2xl overflow-x-auto shadow-2xl">
              {content}
            </pre>
          </article>
        </main>
      </div>
    </div>
  );
}
