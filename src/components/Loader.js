import { Loader2 } from 'lucide-react';

export default function Loader({ className = "w-4 h-4", ...props }) {
  return <Loader2 className={`animate-spin ${className}`} {...props} />;
}
