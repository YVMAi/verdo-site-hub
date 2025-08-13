
import { ComingSoonCard } from "@/components/ComingSoonCard";

const GenerationData = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Generation Data</h1>
        <p className="text-gray-600">Track and manage solar and wind generation metrics</p>
      </div>
      
      <ComingSoonCard 
        title="Generation Data Dashboard"
        description="Comprehensive solar and wind generation data entry and monitoring tools will be available here soon."
      />
    </div>
  );
};

export default GenerationData;
