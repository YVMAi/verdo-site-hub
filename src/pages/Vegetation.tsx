
import { ComingSoonCard } from "@/components/ComingSoonCard";

const Vegetation = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vegetation Management</h1>
        <p className="text-gray-600">Monitor and control vegetation around renewable energy sites</p>
      </div>
      
      <ComingSoonCard 
        title="Vegetation Control"
        description="Track vegetation growth patterns and schedule maintenance to ensure optimal site performance."
      />
    </div>
  );
};

export default Vegetation;
