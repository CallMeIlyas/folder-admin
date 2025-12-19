import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  isCustom?: boolean;
}

export default function FAQItem({ question, answer, isCustom = false }: FAQItemProps) {
  const [isActive, setIsActive] = useState(false);

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  const containerClasses = isCustom 
    ? 'bg-[#f5d7d6] rounded-xl mb-3 shadow-sm overflow-hidden'
    : 'bg-[#f7f5f5] rounded-xl mb-3 shadow-sm overflow-hidden';

  return (
    <div className={containerClasses}>
      <button 
        onClick={toggleActive}
        className="font-poppinsBold bg-transparent border-none w-full text-left font-extrabold text-sm md:text-base px-4 md:px-5 py-3 md:py-3.5 cursor-pointer outline-none flex justify-between items-center"
      >
        <span className="text-left flex-1 pr-2">{question}</span>
        <FaChevronDown 
          size={18}
          className={`shrink-0 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}
        />
      </button>
      <div 
        className={`block overflow-hidden transition-all duration-300 ${isActive ? 'max-h-[500px] py-2.5 px-4 md:px-5' : 'max-h-0 py-0 px-4 md:px-5'}`}
      >
        {/*  wrapper font style untuk semua answer */}
        <div className="text-xs md:text-[13px] text-black leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}