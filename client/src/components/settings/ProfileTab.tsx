import { useAuthStore } from '@/stores/auth.store';
import { Info } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function ProfileTab() {
  const { user } = useAuthStore();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#142814] text-white flex items-center justify-center text-xl font-semibold">
          {getInitials(user.name)}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#0A1F0A]">{user.name}</h3>
          <p className="text-sm text-[#5A6B5A]">{user.email}</p>
          <span className="inline-flex mt-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#E8F0E8] text-[#0A1F0A] border border-[#D4E4D4]">
            {user.role}
          </span>
        </div>
      </div>

      <div className="h-px bg-[#E2EFE2]" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <MetadataField label="Full Name" value={user.name} />
        <MetadataField label="Email" value={user.email} />
        <MetadataField label="Role" value={user.role} />
        <MetadataField label="Member Since" value={formatDate(user.createdAt)} mono />
      </div>

      <div className="bg-[#F9FBF9] rounded-lg p-4 border border-[#E2EFE2]">
        <p className="text-xs text-[#8A9A8A] flex items-center gap-2">
          <Info className="w-3.5 h-3.5" />
          Password changes must be requested through your system administrator.
        </p>
      </div>
    </div>
  );
}

function MetadataField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-[#5A6B5A] mb-1">{label}</p>
      <p className={`text-sm font-medium text-[#0A1F0A] ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
