import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-verdo-jade/10 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-verdo-jade" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Report Generation</h1>
            <p className="text-muted-foreground mt-1">
              Generate and manage comprehensive reports
            </p>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>
              Select a report type to generate detailed insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Report generation features coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}