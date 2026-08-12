'use client'

import { useState, useEffect, useCallback, useMemo, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Github, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Project } from '@/data/types'
import { formatDate } from '@/lib/utils'

interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [imgSrc, setImgSrc] = useState(project?.image || '')
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const images = useMemo(() => {
    if (!project) return []
    const imgs = [project.image]
    if (Array.isArray((project as any).images) && (project as any).images.length > 0) {
      const gallery = (project as any).images as string[]
      // Add gallery images, ensuring we don't duplicate the cover if it's identical
      gallery.forEach(img => {
        if (img !== project.image) imgs.push(img)
      })
    }
    return imgs
  }, [project])

  useEffect(() => {
    if (!project) return
    setImgSrc(images[0] || '')
    setHasError(false)
    setIsLoading(true)
    setActiveImageIndex(0)
  }, [project, images])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape as any)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape as any)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleImageError = useCallback(() => {
    if (!hasError) {
      setHasError(true)
      setImgSrc('/images/projects/nebula.jpg')
    } else {
      setImgSrc('')
    }
  }, [hasError])

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleLiveDemoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (project?.liveUrl) {
      window.open(project.liveUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleGithubClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (project?.githubUrl) {
      window.open(project.githubUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (images.length > 1) {
      setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (images.length > 1) {
      setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }
  }

  const handleThumbnailClick = (index: number) => {
    setActiveImageIndex(index)
    setIsLoading(true)
  }

  if (!project) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-hidden flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          aria-describedby="project-modal-description"
        >
          {/* Header Bar with Close Button */}
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-900">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {project.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Close modal"
            >
              <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Image Gallery */}
            <div className="relative h-64 md:h-96 lg:h-[500px] flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              {images[activeImageIndex] ? (
                <>
                  <Image
                    src={images[activeImageIndex]}
                    alt={`${project.title} - Image ${activeImageIndex + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    className={`
                          object-contain
                          ${isLoading ? 'opacity-0' : 'opacity-100'}
                          transition-opacity duration-300
                        `}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    priority
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        Loading image...
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    {project.title}
                  </span>
                </div>
              )}

              {/* Image Navigation - Only show if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-110 shadow-lg z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-110 shadow-lg z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 text-white text-sm rounded-full z-10">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </>
              )}

            </div>

            {/* Image Thumbnails (if multiple images) */}
            {images.length > 1 && (
              <div className="flex gap-2 p-4 bg-gray-50 dark:bg-gray-800 overflow-x-auto border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`
                          relative w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden
                          border-2 transition-all hover:scale-105
                          ${activeImageIndex === index
                        ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-1'
                        : 'border-transparent opacity-70 hover:opacity-100'
                      }
                        `}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5 flex-shrink-0" />
                  <span className="text-base md:text-lg">{formatDate(project.date)}</span>
                  {project.featured && (
                    <Badge variant="warning" className="text-sm">
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {project.role && (
                    <Badge variant="default" className="text-sm">
                      {project.role}
                    </Badge>
                  )}
                  {project.status && (
                    <Badge variant="secondary" className="text-sm">
                      {project.status}
                    </Badge>
                  )}
                </div>
              </div>

              <p
                id="project-modal-description"
                className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed"
              >
                {project.longDescription}
              </p>

              {/* Technologies */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Technologies Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string) => (
                    <Badge
                      key={tech}
                      variant="primary"
                      className="text-sm py-1.5 px-3"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-8">
                <ul className="space-y-3">
                  {project.highlights.map((highlight: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <div className="flex-shrink-0 w-2 h-2 mt-2.5 rounded-full bg-primary-600 dark:bg-primary-400" />
                      <span className="text-base leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Sections */}
              {project.challenges && project.challenges.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Challenges & Solutions
                  </h3>
                  <ul className="space-y-3">
                    {project.challenges.map((challenge: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                      >
                        <div className="flex-shrink-0 w-2 h-2 mt-2.5 rounded-full bg-orange-500" />
                        <span className="text-base leading-relaxed">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                {project.liveUrl && (
                  <Button
                    size="lg"
                    variant="primary"
                    icon={ExternalLink}
                    onClick={handleLiveDemoClick}
                    className="flex-1 min-w-0"
                    aria-label={`Visit live site: ${project.title}`}
                  >
                    <span className="truncate">View Live Site</span>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button
                    size="lg"
                    variant="outline"
                    icon={Github}
                    onClick={handleGithubClick}
                    className="flex-1 min-w-0"
                    aria-label={`View source code on GitHub: ${project.title}`}
                  >
                    <span className="truncate">View Source Code</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}