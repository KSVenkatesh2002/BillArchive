import fs from 'fs';
import path from 'path';
import { Layers } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

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
    <article className="prose prose-invert prose-sm max-w-none space-y-6 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-p:leading-relaxed prose-code:text-orange-400 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-[0.85em] prose-code:break-words prose-code:before:content-none prose-code:after:content-none prose-a:text-orange-500 hover:prose-a:text-orange-400 prose-headings:text-zinc-100">
      <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl mb-8 flex items-center gap-3">
        <Layers className="w-5 h-5 text-orange-400" />
        <span className="text-xs font-mono text-zinc-400">
          Viewing: <strong className="text-zinc-200">docs/{docPath}.md</strong>
        </span>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-8 rounded-2xl shadow-2xl">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={{
            table: ({node, ...props}) => (
              <div className="overflow-x-auto w-full my-6 rounded-lg border border-zinc-800/80">
                <table className="w-full text-left border-collapse" {...props} />
              </div>
            ),
            th: ({node, ...props}) => <th className="bg-zinc-900/50 p-3 font-semibold text-zinc-300 border-b border-zinc-800" {...props} />,
            td: ({node, ...props}) => <td className="p-3 border-b border-zinc-800/50 text-zinc-400" {...props} />
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
