import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageCarouselProps {
  images: string[];
  title: string;
  className?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  title, 
  className = "" 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Use all provided images, fallback to single image if only one exists
  const imageViews = images.length > 0 ? images : [];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % imageViews.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + imageViews.length) % imageViews.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (imageViews.length === 0) {
    return (
      <div className={`aspect-[16/10] bg-background-secondary rounded-lg flex items-center justify-center ${className}`}>
        <Camera className="w-16 h-16 text-foreground-muted" />
      </div>
    );
  }

  return (
    <div className={`group relative aspect-[16/10] rounded-lg overflow-hidden ${className}`}>
      {/* Main Image */}
      <div className="relative w-full h-full">
        <img
          src={imageViews[currentIndex]}
          alt={`${title} - Imagem ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        {/* Image Counter */}
        <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Camera className="w-3 h-3" />
          {currentIndex + 1}/{imageViews.length}
        </div>
        
        {/* Navigation Arrows */}
        {imageViews.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white hover:bg-black/80 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={prevImage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white hover:bg-black/80 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={nextImage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
        
        {/* Dots Indicator */}
        {imageViews.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {imageViews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white shadow-lg' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 animate-fade-in">
            <Camera className="w-4 h-4" />
            Ver todas as fotos
          </div>
        </div>
      </div>
    </div>
  );
};