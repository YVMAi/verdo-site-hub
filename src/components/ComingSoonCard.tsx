
import { Clock, Leaf } from 'lucide-react';

interface ComingSoonCardProps {
  title: string;
  description?: string;
}

export function ComingSoonCard({ title, description }: ComingSoonCardProps) {
  return (
    <div className="verdo-coming-soon animate-fade-in">
      <div className="verdo-card max-w-md mx-auto">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-verdo-jade/10 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-verdo-jade" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        
        <p className="text-gray-600 mb-6">
          {description || "This feature is coming soon. We're working hard to bring you the best data management experience."}
        </p>
        
        <div className="flex items-center justify-center gap-2 text-verdo-jade font-medium">
          <Leaf className="w-4 h-4" />
          <span>Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
