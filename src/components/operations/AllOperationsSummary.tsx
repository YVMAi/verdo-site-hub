
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClientSiteSelector } from "@/components/ClientSiteSelector";
import { useClientContext } from "@/contexts/ClientContext";
import { 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Scissors,
  Droplets,
  Search,
  Leaf
} from "lucide-react";

const operationsSummary = [
  {
    name: 'Grass Cutting',
    icon: Scissors,
    status: 'completed',
    entriesCount: 12,
    lastEntry: '19-Aug-25',
    completionRate: '100%'
  },
  {
    name: 'Cleaning',
    icon: Droplets,
    status: 'in-progress',
    entriesCount: 8,
    lastEntry: '19-Aug-25',
    completionRate: '75%'
  },
  {
    name: 'Inspection',
    icon: Search,
    status: 'pending',
    entriesCount: 0,
    lastEntry: 'None',
    completionRate: '0%'
  },
  {
    name: 'Vegetation Control',
    icon: Leaf,
    status: 'pending',
    entriesCount: 0,
    lastEntry: 'None',
    completionRate: '0%'
  }
];

export const AllOperationsSummary: React.FC = () => {
  const { selectedClient, selectedSite, setSelectedSite } = useClientContext();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-gray-600">Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Operations Summary</h2>
          <p className="text-gray-600">Review and export all daily operations data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Daily Report
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export All Data
          </Button>
        </div>
      </div>

      {/* Client Site Selector */}
      <ClientSiteSelector 
        selectedClient={selectedClient}
        selectedSite={selectedSite}
        onSiteChange={setSelectedSite}
      />

      {/* Operations Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {operationsSummary.map((operation) => {
          const IconComponent = operation.icon;
          return (
            <Card key={operation.name} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-sm font-medium">{operation.name}</CardTitle>
                  </div>
                  {getStatusIcon(operation.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  {getStatusBadge(operation.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Entries</span>
                  <span className="font-medium">{operation.entriesCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Entry</span>
                  <span className="text-sm">{operation.lastEntry}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion</span>
                  <span className="font-medium text-green-600">{operation.completionRate}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Daily Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Operation</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Planned</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Actual</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Deviation</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">Grass Cutting</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">150</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">150</td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-green-600">0</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <Badge className="bg-green-100 text-green-700">Complete</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">Cleaning</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">200</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">150</td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-red-600">-50</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">Inspection</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">5</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">0</td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-red-600">-5</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <Badge variant="outline">Pending</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
