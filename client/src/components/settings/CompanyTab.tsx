import { Building2 } from 'lucide-react';

export function CompanyTab() {
  return (
    <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#E8F0E8] flex items-center justify-center">
          <Building2 className="w-5 h-5 text-[#8A9A8A]" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#0A1F0A]">Company Information</h3>
          <p className="text-xs text-[#8A9A8A]">Centrally managed by administrator</p>
        </div>
      </div>

      <div className="bg-[#F9FBF9] rounded-lg p-5 border border-dashed border-[#D4E4D4] text-center">
        <p className="text-sm text-[#5A6B5A]">
          Company metadata is managed at the infrastructure level.
        </p>
        <p className="text-xs text-[#8A9A8A] mt-1">
          Contact support to update GSTIN, address, or billing details.
        </p>
      </div>
    </div>
  );
}
