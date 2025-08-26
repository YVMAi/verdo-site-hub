
import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Field {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  readonly?: boolean;
}

interface MobileCardProps {
  title: string;
  fields: Field[];
  className?: string;
}

export const MobileCard: React.FC<MobileCardProps> = ({ title, fields, className }) => {
  return (
    <div className={cn("bg-white border rounded-lg p-4 space-y-3", className)}>
      <h3 className="font-medium text-verdo-navy border-b pb-2">{title}</h3>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={index} className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <Input
              type={field.type || 'text'}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              className={cn(
                "w-full",
                field.error && "border-destructive",
                field.readonly && "bg-gray-50"
              )}
              placeholder={field.placeholder}
              readOnly={field.readonly}
              step={field.type === 'number' ? '0.01' : undefined}
            />
            {field.error && (
              <p className="text-xs text-destructive">{field.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
