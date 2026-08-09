import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function Unauthorized() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="min-h-dvh flex items-center justify-center bg-bg-primary p-4">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 rounded-full bg-warning-bg flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="h-8 w-8 text-warning" aria-hidden="true" />
        </div>
        <h1 className="text-h2 text-text-primary mb-2">Access Denied</h1>
        <p className="text-body text-text-secondary mb-6">
          You don't have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <Button asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </motion.div>
  );
}
