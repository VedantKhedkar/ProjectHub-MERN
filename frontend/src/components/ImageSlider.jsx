import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Assuming you use lucide-react or similar icons

const ImageSlider = ({ images, projectName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Safety check: if no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-slate-800 flex items-center justify-center text-slate-500">
        No images available
      </div>
    );
  }

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className="relative w-full h-[500px] group">
      {/* CRITICAL FIX: 
         Use `images[currentIndex]` directly. 
         Do NOT add `http://localhost:5000` here because ProjectDetailPage already did it.
      */}
      <img
        src={images[currentIndex]} 
        alt={`${projectName} slide ${currentIndex}`}
        className="w-full h-full object-cover duration-500"
      />

      {/* Left Arrow */}
      <div 
        className="hidden group-hover:block absolute top-[50%] -translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition-all"
        onClick={prevSlide}
      >
        <ChevronLeft size={30} />
      </div>

      {/* Right Arrow */}
      <div 
        className="hidden group-hover:block absolute top-[50%] -translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition-all"
        onClick={nextSlide}
      >
        <ChevronRight size={30} />
      </div>

      {/* Dots/Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, slideIndex) => (
          <div
            key={slideIndex}
            onClick={() => setCurrentIndex(slideIndex)}
            className={`transition-all duration-300 cursor-pointer w-3 h-3 rounded-full ${
              currentIndex === slideIndex ? 'bg-blue-500 scale-110' : 'bg-white/50 hover:bg-white'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;