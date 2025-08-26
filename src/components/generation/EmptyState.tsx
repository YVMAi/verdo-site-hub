
import React from 'react';

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="bg-white border rounded-lg">
      <div className="p-8 text-center">
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
