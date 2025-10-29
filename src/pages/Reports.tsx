import { FileText, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Reports() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      {/* Top Navigation Bar */}
      <div className="bg-[hsl(var(--verdo-navy))] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Report Generation</h1>
          <p className="text-sm text-white/80">Generate and manage reports</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Report Type Selector */}
          <Select>
            <SelectTrigger className="bg-white/10 border-white/20 text-white h-8 w-48">
              <SelectValue placeholder="Select report type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="generation">Generation Report</SelectItem>
              <SelectItem value="operations">Operations Report</SelectItem>
              <SelectItem value="maintenance">Maintenance Report</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Filter Button */}
          <Button className="bg-white/10 hover:bg-white/20 border-white/20 text-white h-8">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
          {/* Generate Button */}
          <Button className="bg-white/10 hover:bg-white/20 border-white/20 text-white h-8">
            <Download className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Reports</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Generate and download reports for your sites
            </p>
          </div>
          
          <div className="bg-white border rounded-lg p-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Report generation features coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}