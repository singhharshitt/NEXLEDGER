import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-[#F0F4F0] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-[#FFF1F2] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-[#F43F5E]" />
        </div>
        <h1 className="text-3xl font-bold text-[#0A1F0A] tracking-tight font-space">
          Access denied
        </h1>
        <p className="text-[#5A6B5A] mt-3 text-sm leading-relaxed">
          You don't have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <Link to="/dashboard" className="inline-block mt-8">
          <Button className="h-10 px-6 bg-[#142814] text-white rounded-lg text-sm hover:bg-[#1a2e1a]">
            Return to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
