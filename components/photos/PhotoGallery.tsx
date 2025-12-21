'use client';

// ============================================================
// BARRELVERSE - PHOTO GALLERY COMPONENT
// Display and select photos for spirits in collections
// Created: December 21, 2025
// ============================================================

import React, { useState, useEffect } from 'react';
import { 
  Check, ThumbsUp, ThumbsDown, User, Camera, 
  ChevronLeft, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  thumbnail?: string;
  quality_score: number;
  source: string;
  upvotes: number;
  downvotes: number;
  is_primary: boolean;
  is_verified: boolean;
  user_id?: string;
}

interface PhotoGalleryProps {
  spiritId: string;
  spiritName: string;
  defaultImageUrl?: string;
  collectionId?: string;
  selectedImageUrl?: string;
  onSelectImage?: (imageUrl: string, source: string, photoId?: string) => void;
  showUploadButton?: boolean;
  onUploadClick?: () => void;
}

export function PhotoGallery({
  spiritId,
  spiritName,
  defaultImageUrl,
  collectionId,
  selectedImageUrl,
  onSelectImage,
  showUploadButton = true,
  onUploadClick
}: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [votingId, setVotingId] = useState<string | null>(null);
  
  // Fetch photos for this spirit
  useEffect(() => {
    async function fetchPhotos() {
      try {
        setLoading(true);
        const response = await fetch(`/api/photos?spiritId=${spiritId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load photos');
        }
        
        const data = await response.json();
        setPhotos(data.photos || []);
        
        // Find selected photo index
        if (selectedImageUrl && data.photos) {
          const idx = data.photos.findIndex((p: Photo) => p.url === selectedImageUrl);
          if (idx >= 0) setSelectedIndex(idx + 1); // +1 because index 0 is default
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load photos');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPhotos();
  }, [spiritId, selectedImageUrl]);
  
  // Build all image options (default + user photos)
  const allImages = [
    { 
      id: 'default', 
      url: defaultImageUrl || '', 
      source: 'default',
      quality_score: 0,
      upvotes: 0,
      downvotes: 0,
      is_primary: false,
      is_verified: true
    },
    ...photos
  ].filter(img => img.url);
  
  const handleVote = async (photoId: string, voteType: 'up' | 'down') => {
    if (photoId === 'default') return;
    
    setVotingId(photoId);
    
    try {
      const response = await fetch('/api/photos/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, voteType }),
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update local state
        setPhotos(prev => prev.map(p => 
          p.id === photoId 
            ? { ...p, upvotes: result.upvotes, downvotes: result.downvotes }
            : p
        ));
      }
    } catch (err) {
      console.error('Vote error:', err);
    } finally {
      setVotingId(null);
    }
  };
  
  const handleSelect = (image: typeof allImages[0], index: number) => {
    setSelectedIndex(index);
    if (onSelectImage) {
      onSelectImage(
        image.url, 
        image.source,
        image.id !== 'default' ? image.id : undefined
      );
    }
  };
  
  const goToPrevious = () => {
    const newIndex = selectedIndex === 0 ? allImages.length - 1 : selectedIndex - 1;
    handleSelect(allImages[newIndex], newIndex);
  };
  
  const goToNext = () => {
    const newIndex = selectedIndex === allImages.length - 1 ? 0 : selectedIndex + 1;
    handleSelect(allImages[newIndex], newIndex);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-red-500">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }
  
  const currentImage = allImages[selectedIndex];
  
  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden aspect-square">
        {currentImage ? (
          <img
            src={currentImage.url}
            alt={spiritName}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No image available
          </div>
        )}
        
        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        
        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}
        
        {/* Selected Badge */}
        {selectedImageUrl === currentImage?.url && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            Selected
          </div>
        )}
        
        {/* Source Badge */}
        {currentImage && currentImage.source !== 'default' && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-1">
            <User className="w-3 h-3" />
            Community Photo
          </div>
        )}
      </div>
      
      {/* Photo Info & Actions */}
      {currentImage && currentImage.id !== 'default' && (
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-3">
            {/* Quality Score */}
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Quality</div>
              <div className={`font-bold ${
                currentImage.quality_score >= 70 ? 'text-green-500' :
                currentImage.quality_score >= 50 ? 'text-amber-500' : 'text-red-500'
              }`}>
                {currentImage.quality_score}%
              </div>
            </div>
            
            {/* Verified Badge */}
            {currentImage.is_verified && (
              <div className="flex items-center gap-1 text-green-500">
                <Check className="w-4 h-4" />
                <span className="text-xs">Verified</span>
              </div>
            )}
          </div>
          
          {/* Voting */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote(currentImage.id, 'up')}
              disabled={votingId === currentImage.id}
              className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">{currentImage.upvotes}</span>
            </button>
            <button
              onClick={() => handleVote(currentImage.id, 'down')}
              disabled={votingId === currentImage.id}
              className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="text-sm font-medium">{currentImage.downvotes}</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Thumbnail Strip */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleSelect(image, index)}
              className={`
                flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                ${selectedIndex === index 
                  ? 'border-amber-500 ring-2 ring-amber-500/30' 
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <img
                src={image.thumbnail || image.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {image.source === 'default' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs">
                  Default
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Upload Button */}
      {showUploadButton && (
        <button
          onClick={onUploadClick}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Add Your Photo
        </button>
      )}
      
      {/* Select Button */}
      {onSelectImage && collectionId && (
        <button
          onClick={() => handleSelect(currentImage!, selectedIndex)}
          className="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
        >
          Use This Photo in My Collection
        </button>
      )}
    </div>
  );
}

export default PhotoGallery;
