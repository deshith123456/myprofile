'use client'

import { Badge } from '@/data/types'
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { Upload, X, Award, Plus } from 'lucide-react'

interface UploadedBadge {
  id: string
  name: string
  image: string // object URL
  provider?: string
}

export function Badges({ badges }: { badges: Badge[] }) {
  const [uploadedBadges, setUploadedBadges] = useState<UploadedBadge[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [badgeName, setBadgeName] = useState('')
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const serverBadges = (badges || []).filter(b => b.image && b.image.trim() !== '')

  const allBadges: { id: string; name: string; image: string; provider?: string }[] = [
    ...serverBadges,
    ...uploadedBadges,
  ]

  // Only hide section if there are no server badges AND no uploads AND form is not open
  // Always show if there are uploads
  const hasBadges = allBadges.length > 0

  // Double for seamless loop
  const doubledBadges = hasBadges ? [...allBadges, ...allBadges] : []

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreviewFile(file)
    setPreviewUrl(url)
    setBadgeName(file.name.replace(/\.[^/.]+$/, ''))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleAddBadge = () => {
    if (!previewUrl) return
    const newBadge: UploadedBadge = {
      id: `uploaded-${Date.now()}`,
      name: badgeName || 'My Badge',
      image: previewUrl,
      provider: 'Uploaded',
    }
    setUploadedBadges(prev => [...prev, newBadge])
    setPreviewFile(null)
    setPreviewUrl(null)
    setBadgeName('')
    setShowForm(false)
  }

  const handleRemoveBadge = (id: string) => {
    setUploadedBadges(prev => {
      const removed = prev.find(b => b.id === id)
      if (removed) URL.revokeObjectURL(removed.image)
      return prev.filter(b => b.id !== id)
    })
  }

  const cancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewFile(null)
    setPreviewUrl(null)
    setBadgeName('')
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-[#030711] border-t border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="container mx-auto px-4 mb-10 flex flex-col items-center text-center gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
            <Award className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Digital Credentials &amp; Badges
          </h3>
        </div>
        <button
          onClick={() => setShowForm(prev => !prev)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Digital Badge
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="container mx-auto px-4 mb-10 max-w-lg"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">Upload a Digital Badge</h4>

            {!previewUrl ? (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200
                  ${isDragging
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
              >
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                  <Upload className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Drag &amp; drop your badge image
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">or click to browse (PNG, JPG, SVG)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="relative flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-28 h-28 object-contain rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2"
                  />
                  <button
                    onClick={cancelPreview}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Badge Name</label>
                  <input
                    type="text"
                    value={badgeName}
                    onChange={e => setBadgeName(e.target.value)}
                    placeholder="e.g. AWS Solutions Architect"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={cancelPreview}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBadge}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition"
                  >
                    Add to Marquee
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Uploaded badges management row */}
      {uploadedBadges.length > 0 && (
        <div className="container mx-auto px-4 mb-8">
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wider font-semibold">Your Uploaded Badges</p>
          <div className="flex flex-wrap justify-center gap-3">
            {uploadedBadges.map(badge => (
              <div
                key={badge.id}
                className="relative group flex flex-col items-center gap-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={badge.image}
                  alt={badge.name}
                  className="w-14 h-14 object-contain rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1 shadow-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[60px] text-center truncate">{badge.name}</p>
                <button
                  onClick={() => handleRemoveBadge(badge.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex transition"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marquee */}
      {hasBadges && (
        <div className="relative w-full overflow-hidden mask-linear-fade py-4">
          <motion.div
            className="flex gap-6 w-max px-6"
            animate={{ x: '-50%' }}
            initial={{ x: 0 }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              duration: Math.max(25, allBadges.length * 3.5),
              ease: 'linear',
            }}
          >
            {doubledBadges.map((badge, idx) => (
              <div
                key={`${badge.id}-${idx}`}
                className="relative shrink-0 w-28 h-28 md:w-36 md:h-36 flex items-center justify-center p-3 bg-gray-900/80 dark:bg-gray-900 rounded-3xl border border-gray-700/60 dark:border-gray-800 shadow-lg hover:shadow-xl hover:scale-105 hover:border-primary-500/50 transition-all duration-300 cursor-default"
                title={badge.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={badge.image}
                  alt={badge.name}
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Empty state */}
      {!hasBadges && !showForm && (
        <div className="container mx-auto px-4 flex flex-col items-center gap-3 py-8 text-center">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl">
            <Award className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
            No digital badges yet. Click <strong>Add Digital Badge</strong> above to showcase your credentials here!
          </p>
        </div>
      )}
    </section>
  )
}
