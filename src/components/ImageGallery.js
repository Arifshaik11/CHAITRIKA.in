import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageGallery = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [visibleImages, setVisibleImages] = useState(new Set());
  const imageRefs = useRef([]);

  // Sample gallery images - magnetic frames showcase
  const galleryImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1606986628024-c8f1a3f7b7e0?w=500&h=600&fit=crop',
      alt: 'Magnetic Photo Frame - Acrylic Magnetic',
      category: 'Magnetic',
      height: 'tall'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1516035069371-29ad0ded3438?w=500&h=400&fit=crop',
      alt: 'Magnetic Frame Display',
      category: 'Magnetic',
      height: 'normal'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1514306688941-586cb221d7d7?w=500&h=500&fit=crop',
      alt: 'Family Photos Magnetic Frame',
      category: 'Magnetic',
      height: 'square'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1505033575518-a36ea2ef75cb?w=500&h=600&fit=crop',
      alt: 'Couple Photo Magnetic Frame',
      category: 'Magnetic',
      height: 'tall'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1516257309123-6f32b52a4499?w=500&h=400&fit=crop',
      alt: 'Memories Display',
      category: 'Magnetic',
      height: 'normal'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=500&fit=crop',
      alt: 'Personalized Magnetic Frame',
      category: 'Magnetic',
      height: 'square'
    },
    {
      id: 7,
      src: 'https://images.unsplash.com/photo-1525633277198-c73d01749bb4?w=500&h=600&fit=crop',
      alt: 'Premium Magnetic Display',
      category: 'Magnetic',
      height: 'tall'
    },
    {
      id: 8,
      src: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=400&fit=crop',
      alt: 'Modern Magnetic Frame',
      category: 'Magnetic',
      height: 'normal'
    }
  ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = imageRefs.current.indexOf(entry.target);
            if (index !== -1) {
              setVisibleImages((prev) => {
                const newSet = new Set(prev);
                newSet.add(index);
                return newSet;
              });
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      imageRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === null ? 0 : (prev + 1) % galleryImages.length
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === null ? galleryImages.length - 1 : (prev - 1 + galleryImages.length) % galleryImages.length
    );
  };

  const getHeightClass = (height) => {
    switch (height) {
      case 'tall':
        return 'row-span-2';
      case 'square':
        return 'row-span-1';
      default:
        return 'row-span-1';
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Gallery of Memories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our beautiful collection of custom photo frames and personalized gifts
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-max">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              ref={(el) => (imageRefs.current[index] = el)}
              className={`group relative overflow-hidden rounded-lg shadow-lg cursor-pointer transform transition-all duration-500 ${
                getHeightClass(image.height)
              } ${
                visibleImages.has(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              onClick={() => setSelectedImageIndex(index)}
            >
              {/* Image Container */}
              <div className="relative w-full h-full overflow-hidden bg-gray-100">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Dark Overlay on Hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                  {image.category}
                </div>

                {/* View Lightbox Text - Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-100 scale-90">
                    <div className="bg-white rounded-full p-3 inline-block mb-2 shadow-lg transform group-hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                        />
                      </svg>
                    </div>
                    <p className="text-white font-semibold drop-shadow-lg">View Image</p>
                  </div>
                </div>

                {/* Gradient Overlay at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Image Number */}
                <div className="absolute bottom-2 right-3 text-white/70 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {index + 1}/{galleryImages.length}
                </div>
              </div>

              {/* Accent Border */}
              <div className="absolute inset-0 rounded-lg border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImageIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
            {/* Lightbox Container */}
            <div className="relative max-w-4xl w-full max-h-screen flex items-center justify-center animate-zoomIn">
              {/* Close Button */}
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-all duration-300 group"
              >
                <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>

              {/* Main Image */}
              <div className="relative w-full flex items-center justify-center">
                <img
                  src={galleryImages[selectedImageIndex].src}
                  alt={galleryImages[selectedImageIndex].alt}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />

                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white rounded-b-lg">
                  <h3 className="text-2xl font-bold mb-2">
                    {galleryImages[selectedImageIndex].alt}
                  </h3>
                  <p className="text-gray-200">
                    {galleryImages[selectedImageIndex].category} Collection
                  </p>
                  <p className="text-sm text-gray-300 mt-2">
                    Image {selectedImageIndex + 1} of {galleryImages.length}
                  </p>
                </div>
              </div>

              {/* Previous Button */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-all duration-300 group hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6 text-white group-hover:scale-125 transition-transform" />
              </button>

              {/* Next Button */}
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition-all duration-300 group hover:scale-110"
              >
                <ChevronRight className="w-6 h-6 text-white group-hover:scale-125 transition-transform" />
              </button>

              {/* Keyboard Navigation Info */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-sm">
                ← / → to navigate • ESC to close
              </div>
            </div>

            {/* Keyboard Navigation */}
            <input
              type="text"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') prevImage();
                if (e.key === 'ArrowRight') nextImage();
                if (e.key === 'Escape') setSelectedImageIndex(null);
              }}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Animation Styles */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes zoomIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }

          .animate-zoomIn {
            animation: zoomIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </section>
  );
};

export default ImageGallery;