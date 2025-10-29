import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserManagement() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-verdo-navy/10 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-verdo-navy" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage users, roles, and permissions
            </p>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>
              View and manage user accounts and access levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                User management features coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}