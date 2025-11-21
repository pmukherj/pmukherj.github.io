import React from 'react';
import { motion } from 'framer-motion';
const ComingSoon = () => {
  return <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.8
    }} className="space-y-8">
        <div className="mx-auto h-32 w-32 rounded-full bg-gray-200 overflow-hidden mb-4">
          <img src="/images/pj-profile.jpeg" alt="Prasenjit Mukherjee" className="h-full w-full object-cover" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-light tracking-tight">
            Prasenjit Mukherjee
          </h1>
          <h2 className="text-xl font-medium text-gray-700">
            Robotics and AI Engineer
          </h2>
          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.5,
          duration: 1
        }} className="mt-6">
            <p className="text-2xl font-serif font-light text-gray-600">
              Coming soon...
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>;
};
export default ComingSoon;