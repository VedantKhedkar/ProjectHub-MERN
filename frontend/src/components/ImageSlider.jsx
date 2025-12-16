import { useState } from 'react';

function ImageSlider({ images, projectName }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 bg-zinc-700 rounded-lg text-zinc-400">
        No images available for this project.
      </div>
    );
  }
  
  // Handlers for navigation (optional, but good for large image viewing)
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };
  
  const currentImageSrc = `http://localhost:5000${images[currentIndex]}`;

  return (
    <div className="w-full mb-6">
      
      {/* --- 1. MAIN IMAGE DISPLAY (Large View) --- */}
      <div className="relative w-full overflow-hidden rounded-lg shadow-xl h-[400px] mb-4">
        <img
          src={currentImageSrc}
          alt={`${projectName} screenshot ${currentIndex + 1}`}
          // Use object-contain to ensure the full image is visible without cropping
          className="w-full h-full object-contain bg-zinc-800 rounded-lg" 
        />

        {/* Manual navigation buttons (for quick back/forth) */}
        {images.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 text-white rounded-r-lg hover:bg-black/80 transition z-10"
              >
                &lt;
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 text-white rounded-l-lg hover:bg-black/80 transition z-10"
              >
                &gt;
              </button>
            </>
          )}
      </div>

      {/* --- 2. THUMBNAIL GALLERY (Amazon-style navigation) --- */}
      {images.length > 1 && (
          <div className="flex space-x-3 overflow-x-auto p-1">
              {images.map((imagePath, index) => (
                  <div
                      key={index}
                      // Clicking or hovering instantly changes the main image
                      onClick={() => setCurrentIndex(index)}
                      onMouseEnter={() => setCurrentIndex(index)}
                      className={`w-20 h-20 flex-shrink-0 cursor-pointer p-1 rounded-md transition-all duration-200
                        ${index === currentIndex 
                            ? 'border-2 border-cyan-400 bg-zinc-600' // Active thumbnail style
                            : 'border border-zinc-700 hover:border-cyan-500 bg-zinc-700' // Inactive thumbnail style
                        }`}
                  >
                      <img
                          src={`http://localhost:5000${imagePath}`}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover rounded-sm"
                      />
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}

export default ImageSlider;