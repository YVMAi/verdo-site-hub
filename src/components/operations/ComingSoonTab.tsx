
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonTabProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const ComingSoonTab: React.FC<ComingSoonTabProps> = ({ title, description, icon: Icon }) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <Icon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon</h3>
          <p className="text-gray-500 max-w-md">
            {title} functionality is currently under development. 
            This feature will be available in an upcoming release.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
