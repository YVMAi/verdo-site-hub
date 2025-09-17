import React, { useState, useRef } from 'react';
import { Upload, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
interface BulkUploadModalProps {
  onUpload: (data: any[]) => void;
}
export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  onUpload
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  const handleFile = (file: File) => {
    if (file.type !== 'text/csv') {
      alert('Please upload a CSV file');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const data = parseCSV(text);
      setUploadedData(data);
    };
    reader.readAsText(file);
  };
  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }
    return data;
  };
  const downloadTemplate = () => {
    const headers = ['Date', 'Block-Inverter', 'Daily Grass Cutting', 'Rainfall MM', 'Remarks'];
    const sampleData = ['18-Aug-25,block-1-INV1,45,2,Sample remarks', '18-Aug-25,block-1-INV2,50,2,Sample remarks'];
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grass_cutting_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleUpload = () => {
    onUpload(uploadedData);
    setIsOpen(false);
    setUploadedData([]);
  };
  return <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Grass Cutting Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Upload CSV file with grass cutting data</p>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drag and drop your CSV file here
            </p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Browse Files
            </Button>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
          </div>

          {uploadedData.length > 0 && <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Preview ({uploadedData.length} rows)</h3>
                <Button variant="ghost" size="sm" onClick={() => setUploadedData([])}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(uploadedData[0] || {}).map(key => <th key={key} className="text-left p-1">{key}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData.slice(0, 5).map((row, index) => <tr key={index} className="border-b">
                        {Object.values(row).map((value: any, i) => <td key={i} className="p-1">{value}</td>)}
                      </tr>)}
                  </tbody>
                </table>
                {uploadedData.length > 5 && <p className="text-xs text-gray-500 mt-2">
                    ... and {uploadedData.length - 5} more rows
                  </p>}
              </div>
            </div>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploadedData.length === 0}>
              Upload Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};