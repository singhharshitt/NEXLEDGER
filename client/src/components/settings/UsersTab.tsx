import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';
import { useUsers, useCreateUser } from '@/hooks/useUsers';
import { ErrorState } from '@/components/data-display/ErrorState';

const userSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']),
});

type UserFormValues = z.infer<typeof userSchema>;

export function UsersTab() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: users, isLoading, error, refetch } = useUsers();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm p-10 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#142814]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm">
        <ErrorState title="Unable to load users" message="Something went wrong while fetching team members." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2EFE2] shadow-sm overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-[#E2EFE2]">
        <h3 className="text-sm font-medium text-[#0A1F0A]">Team Members</h3>
        <Button 
          onClick={() => setCreateOpen(true)}
          className="h-9 px-3 bg-[#142814] text-white rounded-lg text-sm hover:bg-[#1a2e1a]"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New User
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#E8F0E8]">
            <tr className="h-10 text-left text-[11px] uppercase tracking-widest text-[#8A9A8A] font-medium">
              <th className="px-4">Name</th>
              <th className="px-4">Email</th>
              <th className="px-4">Role</th>
              <th className="px-4">Status</th>
              <th className="px-4 text-right">Created</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(u => (
              <tr key={u.id} className="h-12 border-b border-[#E2EFE2] last:border-0 hover:bg-[#E8F0E8]/50">
                <td className="px-4 text-sm font-medium text-[#0A1F0A]">{u.name}</td>
                <td className="px-4 text-sm text-[#5A6B5A]">{u.email}</td>
                <td className="px-4">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#E8F0E8] text-[#0A1F0A]">
                    {u.role}
                  </span>
                </td>
                <td className="px-4">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Active
                  </span>
                </td>
                <td className="px-4 text-right font-mono text-xs text-[#8A9A8A]">
                  {formatDate(u.createdAt)}
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-[#5A6B5A]">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateUserModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function CreateUserModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const createMutation = useCreateUser();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'SALES',
    },
  });

  const onSubmit = (data: UserFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: 'User created successfully',
          description: `${data.name} has been added to the team.`,
        });
        onOpenChange(false);
        form.reset();
      },
      onError: (err: any) => {
        toast({
          title: 'Failed to create user',
          description: err.response?.data?.error || err.message || 'Something went wrong',
          type: 'error',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new team member and assign their role.
          </DialogDescription>
        </DialogHeader>

        <form id="create-user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A1F0A]">Full Name</label>
            <Input {...form.register('name')} placeholder="e.g. John Doe" />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A1F0A]">Email</label>
            <Input type="email" {...form.register('email')} placeholder="john@example.com" />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A1F0A]">Temporary Password</label>
            <Input type="password" {...form.register('password')} placeholder="Minimum 6 characters" />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0A1F0A]">Role</label>
            <select 
              value={form.watch('role')} 
              onChange={(e) => form.setValue('role', e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-[#E2EFE2] bg-white px-3 py-2 text-sm text-[#0A1F0A]"
            >
              <option value="ADMIN">Admin</option>
              <option value="SALES">Sales</option>
              <option value="WAREHOUSE">Warehouse</option>
              <option value="ACCOUNTS">Accounts</option>
            </select>
            {form.formState.errors.role && (
              <p className="text-xs text-red-500">{form.formState.errors.role.message}</p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="create-user-form"
            disabled={createMutation.isPending}
            className="bg-[#142814] text-white hover:bg-[#1a2e1a]"
          >
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
