import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  confirmVariant?: 'default' | 'danger';
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  confirmVariant = 'default',
  onConfirm,
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant={confirmVariant} 
            onClick={onConfirm} 
            disabled={isLoading}
            className={confirmVariant === 'default' ? 'bg-[#142814] text-white hover:bg-[#1a2e1a]' : ''}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
