'use client';

import { motion } from 'framer-motion';
import CitizenComplaintForm from '@/components/complaints/CitizenComplaintForm';

export default function CitizenNewComplaintPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen px-4 py-10"
    >
      <CitizenComplaintForm />
    </motion.div>
  );
}
