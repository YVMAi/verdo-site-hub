
import React from 'react';
import { CleaningSiteData } from "@/types/cleaning";

interface CleaningFormProps {
  data: CleaningSiteData | null;
  onDataChange?: (data: CleaningSiteData) => void;
}

export const CleaningForm: React.FC<CleaningFormProps> = ({ data, onDataChange }) => {
  if (!data) {
    return (
      <div className="text-center text-gray-500 text-sm">
        Select client and site to view data
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-gray-500 text-sm">
        Form view for cleaning data entry - Coming Soon
      </div>
    </div>
  );
};
