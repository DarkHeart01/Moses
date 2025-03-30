import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loading({ text = 'Loading...', size = 'md' }: LoadingProps) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size];
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeClass} text-blue-500 animate-spin mb-2`} />
      <p className="text-gray-500">{text}</p>
    </div>
  );
}
