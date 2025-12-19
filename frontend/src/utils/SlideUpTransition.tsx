import { motion } from "framer-motion";
import React from "react";

interface SlideUpTransitionProps {
  children: React.ReactNode;
}

const SlideUpTransition: React.FC<SlideUpTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ y: "100vh" }}      
      animate={{ y: 0 }}            
      exit={{ y: "-20vh", opacity: 0 }}
      transition={{
        duration: 1.6,               
        ease: [0.77, 0, 0.175, 1],  
      }}
      className="min-h-screen w-full bg-white will-change-transform overflow-hidden"
    >
      {children}
    </motion.div>
  );
};

export default SlideUpTransition;