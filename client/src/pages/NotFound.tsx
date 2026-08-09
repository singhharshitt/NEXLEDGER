import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F0F4F0] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-[#E8F0E8] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-10 h-10 text-[#8A9A8A]" />
        </div>
        <h1 className="text-3xl font-bold text-[#0A1F0A] tracking-tight font-space">
          Page not found
        </h1>
        <p className="text-[#5A6B5A] mt-3 text-sm leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="h-10 px-4 border-[#E2EFE2] rounded-lg text-sm hover:bg-[#E8F0E8]"
          >
            Go back
          </Button>
          <Link to="/dashboard">
            <Button className="h-10 px-4 bg-[#142814] text-white rounded-lg text-sm hover:bg-[#1a2e1a]">
              Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
