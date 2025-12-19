import { useState, useCallback, memo } from "react";
import type { FC } from "react";
import html2canvas from "html2canvas";
import { createPortal } from "react-dom";
import LazyImage from "../../utils/LazyImage"; 

interface ProductCardProps {
  imageUrl: string;
  name: string;
}

const ProductCard: FC<ProductCardProps> = memo(({ imageUrl, name }) => {
  const [openModal, setOpenModal] = useState(false);

  const handleScreenshot = useCallback(async () => {
    const imgElement = document.getElementById("preview-image");
    if (!imgElement) return;

    try {
      const canvas = await html2canvas(imgElement as HTMLElement, {
        backgroundColor: null,
        useCORS: true,
        scale: 2,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `${name}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Screenshot failed:", error);
    }
  }, [name]);

  const handleOpenModal = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
  }, []);

  return (
    <>
      <div
        className="group text-center bg-white p-[15px] rounded-[10px] shadow-md transition-transform duration-300 ease-in-out hover:-translate-y-[5px] cursor-pointer"
        onClick={handleOpenModal}
      >
        <LazyImage
          src={imageUrl}
          alt={name}
          placeholder="/placeholder/low-res.jpg" 
          className="w-full aspect-square object-cover rounded-[8px] mb-[12px]"
        />
      </div>

      {openModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
            onClick={handleCloseModal}
          >
            <div
              className="relative animate-fadeZoomCenter max-w-[85vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-50">
                <p className="bg-white/80 px-2 py-1 rounded text-black font-bold text-[16px]">
                  {name}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={handleScreenshot}
                    className="bg-white text-black px-3 py-1 rounded-md shadow text-sm hover:bg-gray-100 transition-colors"
                  >
                    Save Picture
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="bg-white text-black px-3 py-1 rounded-md shadow text-sm hover:bg-gray-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <img
                id="preview-image"
                src={imageUrl}
                alt={name}
                className="block w-auto max-w-[70vw] max-h-[75vh] mx-auto rounded-lg object-contain shadow-xl"
                loading="lazy"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;