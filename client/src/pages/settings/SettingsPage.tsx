import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth.store';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { CompanyTab } from '@/components/settings/CompanyTab';
import { UsersTab } from '@/components/settings/UsersTab';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="p-6 lg:p-8 bg-[#F0F4F0] min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0A1F0A] tracking-tight font-space">
          Settings
        </h1>
        <p className="text-[#5A6B5A] mt-1 text-sm">
          Manage your account and preferences
        </p>
      </div>

      <div className="max-w-3xl">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-[#E8F0E8] rounded-lg p-1 h-10 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="profile" className="rounded-md px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Profile
            </TabsTrigger>
            <TabsTrigger value="company" className="rounded-md px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Company
            </TabsTrigger>
            {user?.role === 'ADMIN' && (
              <TabsTrigger value="users" className="rounded-md px-4 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Users
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="company" className="mt-6">
            <CompanyTab />
          </TabsContent>
          {user?.role === 'ADMIN' && (
            <TabsContent value="users" className="mt-6">
              <UsersTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
