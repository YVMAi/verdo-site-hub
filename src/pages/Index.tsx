
import { ComingSoonCard } from "@/components/ComingSoonCard";
import { Zap, Leaf, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-verdo-jade rounded-2xl flex items-center justify-center shadow-lg">
            <Leaf className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-verdo-jade">Verdo</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your comprehensive data management platform for renewable energy operations
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="verdo-card text-center">
          <div className="w-12 h-12 bg-verdo-jade/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-verdo-jade" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generation Data</h3>
          <p className="text-gray-600">Track solar and wind generation metrics</p>
        </div>
        
        <div className="verdo-card text-center">
          <div className="w-12 h-12 bg-verdo-jade/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-verdo-jade" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Operations Management</h3>
          <p className="text-gray-600">Manage daily operations and maintenance</p>
        </div>
        
        <div className="verdo-card text-center">
          <div className="w-12 h-12 bg-verdo-jade/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-6 h-6 text-verdo-jade" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Environmental Care</h3>
          <p className="text-gray-600">Monitor vegetation and site conditions</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <ComingSoonCard 
        title="Getting Started"
        description="Select a section from the navigation menu to begin managing your renewable energy data. All features are currently in development and will be available soon."
      />
    </div>
  );
};

export default Index;
