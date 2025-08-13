
import { ComingSoonCard } from "@/components/ComingSoonCard";

const GrassCutting = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grass Cutting Operations</h1>
        <p className="text-gray-600">Manage and track grass cutting schedules and activities</p>
      </div>
      
      <ComingSoonCard 
        title="Grass Cutting Management"
        description="Schedule, track, and report on grass cutting operations across all sites."
      />
    </div>
  );
};

export default GrassCutting;
