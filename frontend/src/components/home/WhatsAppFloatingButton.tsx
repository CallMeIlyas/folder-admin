import { useState, useRef, useEffect } from "react";

interface WhatsAppFloatingButtonProps {
  className?: string;
}

const WhatsAppFloatingButton = ({ className = "" }: WhatsAppFloatingButtonProps) => {
  // State untuk WhatsApp button position
  const [whatsappPosition, setWhatsappPosition] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth - 80 : 300,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
  });

  const [isDragging, setIsDragging] = useState(false);
  const whatsappRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const buttonStartPos = useRef({ x: 0, y: 0 });
  const isClick = useRef(true);
  const dragTimeout = useRef<NodeJS.Timeout>();

  // WhatsApp button drag functionality
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Only allow left click for dragging
    if (e.type === 'mousedown' && (e as React.MouseEvent).button !== 0) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    isClick.current = true;
    setIsDragging(false);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragStartPos.current = { x: clientX, y: clientY };
    buttonStartPos.current = { x: whatsappPosition.x, y: whatsappPosition.y };
    
    // Set timeout untuk menentukan click vs drag
    dragTimeout.current = setTimeout(() => {
      isClick.current = false;
    }, 150);
    
    // Add event listeners
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    
    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;
    
    // Check if movement is significant enough to be considered dragging
    if (!isDragging && (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8)) {
      setIsDragging(true);
      isClick.current = false;
      if (dragTimeout.current) {
        clearTimeout(dragTimeout.current);
      }
    }
    
    if (isDragging || (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8)) {
      e.preventDefault();
      
      const newX = buttonStartPos.current.x + deltaX;
      const newY = buttonStartPos.current.y + deltaY;
      
      // Boundary checks
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      const minY = 70; // Jarak dari top untuk header mobile
      
      setWhatsappPosition({
        x: Math.max(10, Math.min(newX, maxX)),
        y: Math.max(minY, Math.min(newY, maxY))
      });
    }
  };

  const handleDragEnd = (e: Event) => {
    // Cleanup timeout
    if (dragTimeout.current) {
      clearTimeout(dragTimeout.current);
    }
    
    if (isDragging) {
      e.preventDefault();
      
      // Snap to nearest edge
      const snapThreshold = window.innerWidth / 2;
      const currentX = whatsappPosition.x;
      const shouldSnapLeft = currentX < snapThreshold;
      
      const finalX = shouldSnapLeft ? 20 : window.innerWidth - 70;
      
      setWhatsappPosition(prev => ({
        x: finalX,
        y: prev.y
      }));
    }
    
    // Reset dragging state
    setTimeout(() => {
      setIsDragging(false);
      isClick.current = true;
    }, 50);
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  };

  // Handle WhatsApp click - langsung buka link
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    if (!isDragging && isClick.current) {
      e.preventDefault();
      window.open('https://wa.me/6281380340307', '_blank', 'noopener,noreferrer');
    }
  };

  // Handle touch end untuk mobile
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging && isClick.current) {
      e.preventDefault();
      window.open('https://wa.me/6281380340307', '_blank', 'noopener,noreferrer');
    }
  };

  // Handle right click - hanya untuk drag, tidak buka context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Reset position on window resize
  useEffect(() => {
    const handleResize = () => {
      setWhatsappPosition(prev => ({
        x: prev.x < window.innerWidth / 2 ? 20 : window.innerWidth - 70,
        y: Math.min(prev.y, window.innerHeight - 60)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      // Cleanup
      if (dragTimeout.current) {
        clearTimeout(dragTimeout.current);
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dragTimeout.current) {
        clearTimeout(dragTimeout.current);
      }
      // Remove any lingering event listeners
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, []);

  return (
    <div
      ref={whatsappRef}
      className={`fixed z-40 rounded-full p-3 shadow-lg transition-all duration-200 ${
        isDragging 
          ? 'scale-110 shadow-xl cursor-grabbing active:scale-110 bg-white border-2 border-[#dcbec1]'
          : 'hover:scale-105 cursor-pointer active:scale-95 bg-[#dcbec1] hover:bg-[#d4b6b9]'
      } ${className}`}
      style={{
        left: `${whatsappPosition.x}px`,
        top: `${whatsappPosition.y}px`,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
      aria-label="Contact WhatsApp"
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleWhatsAppClick}
      onContextMenu={handleContextMenu}
      title="Klik untuk WhatsApp atau drag untuk memindahkan"
    >    
      <svg    
        className={`w-6 h-6 ${isDragging ? 'text-[#dcbec1]' : 'text-gray-800'}`}    
        fill="currentColor"    
        viewBox="0 0 24 24"    
        xmlns="http://www.w3.org/2000/svg"    
      >    
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>   
      </svg>    
    </div>
  );
};

export default WhatsAppFloatingButton;