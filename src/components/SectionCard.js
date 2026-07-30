export default function SectionCard({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
