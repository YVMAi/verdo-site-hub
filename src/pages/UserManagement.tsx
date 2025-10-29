import { Users, Plus, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserManagement() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      {/* Top Navigation Bar */}
      <div className="bg-[hsl(var(--verdo-navy))] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">User Management</h1>
          <p className="text-sm text-white/80">Manage users, roles, and permissions</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input 
              placeholder="Search users..." 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 h-8 pl-9 w-64"
            />
          </div>
          
          {/* Add User Button */}
          <Button className="bg-white/10 hover:bg-white/20 border-white/20 text-white h-8">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
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