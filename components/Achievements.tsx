'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, BookOpen, Calendar, Cloud, FileText, Github, Mic, Newspaper, Trophy, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { CertificateModal } from './CertificateModal'
import type { Achievement, AchievementCategory } from '@/data/types'
import { LucideIcon } from 'lucide-react'

const categoryIcons: Record<AchievementCategory, LucideIcon> = {
  award: Trophy,
  certification: Award,
  reports: BookOpen,
  speaking: Mic,
  event: Calendar,
  article: Newspaper,
}

const categoryLabels: Record<AchievementCategory, string> = {
  award: 'Award',
  certification: 'Certification',
  reports: 'Report',
  speaking: 'Speaking',
  event: 'Event',
  article: 'Article',
}

const filterTabs: { id: AchievementCategory | 'all'; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'All', icon: Award },
  { id: 'certification', label: 'Certifications', icon: Award },
  { id: 'award', label: 'Awards', icon: Trophy },
  { id: 'event', label: 'Events', icon: Calendar },
  { id: 'article', label: 'Articles', icon: Newspaper },
  { id: 'reports', label: 'Reports', icon: BookOpen },
  { id: 'speaking', label: 'Speaking', icon: Mic },
]

const organizationLogos: Record<string, string> = {
  "(ISC)²": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/ISC2_Logo.svg/1200px-ISC2_Logo.svg.png",
  "IBM": "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
  "Splunk": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Splunk_logo.svg/2560px-Splunk_logo.svg.png",
  "Fortinet": "https://upload.wikimedia.org/wikipedia/commons/3/36/Fortinet_logo.svg",
  "LinkedIn Learning": "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
  "Google": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  "Microsoft": "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
  "AWS": "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
  "Cisco": "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg",
  "CompTIA": "https://upload.wikimedia.org/wikipedia/commons/a/a2/CompTIA_logo.svg",
  "EC-Council": "https://upload.wikimedia.org/wikipedia/commons/0/09/EC-Council_logo.png",
  "OffSec": "https://www.offsec.com/wp-content/uploads/2023/12/offsec-logo-light.svg",
  "Udemy": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg",
  "Coursera": "https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg",
}

function AchievementLogo({ achievement, Icon }: { achievement: Achievement, Icon: LucideIcon }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Priority: custom logo > simple icons > hardcoded map
  const customLogo = achievement.orgCustomLogo
  const orgLogo = achievement.organization ? organizationLogos[achievement.organization] : null
  const simpleIconUrl = achievement.orgIconSlug
    ? `https://cdn.simpleicons.org/${achievement.orgIconSlug}/${achievement.orgIconColor || '666666'}`
    : null

  // Determine which image source to use
  const imageSrc = customLogo || simpleIconUrl || orgLogo

  // If no image source at all, just show the icon
  if (!imageSrc) {
    return <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Fallback icon - always rendered behind */}
      <Icon className={`h-5 w-5 text-primary-600 dark:text-primary-400 ${imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'} transition-opacity`} />

      {/* Image overlay - only visible when loaded successfully */}
      {!imageError && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageSrc}
          alt={achievement.organization || 'Organization Logo'}
          className={`absolute inset-0 w-full h-full object-contain ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true)
            setImageLoaded(false)
          }}
        />
      )}
    </div>
  )
}

export function Achievements({ achievements }: { achievements: Achievement[] }) {
  const [selectedCertificate, setSelectedCertificate] = useState<Achievement | null>(null)
  const [showAllCertifications, setShowAllCertifications] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Achievement | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all')

  const handleCertificateClick = (achievement: Achievement) => {
    if (achievement.category === 'reports' && achievement.content) {
      setSelectedReport(achievement)
      setIsReportModalOpen(true)
    } else if (achievement.certificateFile) {
      setSelectedCertificate(achievement)
      setIsModalOpen(true)
    }
  }

  // Filter achievements based on selected category
  const filteredAchievements = activeCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === activeCategory)

  const displayedAchievements = activeCategory === 'certification' && !showAllCertifications
    ? filteredAchievements.slice(0, 4)
    : filteredAchievements

  // Get count for each category
  const getCategoryCount = (category: AchievementCategory | 'all') => {
    if (category === 'all') return achievements.length
    return achievements.filter(a => a.category === category).length
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <section
      id="achievements"
      className="py-20 md:py-32 bg-gray-50 dark:bg-gray-800/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Achievements & <span className="gradient-text">Recognition</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Certifications, awards, reports, and speaking engagements
          </p>
        </motion.div>

        {/* Category Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex overflow-x-auto pb-2 md:pb-0 md:flex-wrap md:justify-center gap-2 mb-12 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
        >
          {filterTabs.map((tab) => {
            const count = getCategoryCount(tab.id)
            const isActive = activeCategory === tab.id
            const TabIcon = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`
                  group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                  ${isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 border border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                <TabIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'}`} />
                <span>{tab.label}</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {count}
                </span>
              </button>
            )
          })}
        </motion.div>

        <motion.div
          key={activeCategory}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayedAchievements.map((achievement) => {
            const Icon = categoryIcons[achievement.category]
            const isPDF = achievement.certificateFile?.toLowerCase().endsWith('.pdf')
            const isImage = achievement.certificateFile && !isPDF

            return (
              <motion.div key={achievement.id} variants={itemVariants}>
                <Card hover className="h-full flex flex-col">
                  {/* Cover Image (for reports) or Certificate Image */}
                  {(achievement.coverImage || achievement.certificateFile) && (
                    <div
                      className={`relative w-full h-48 rounded-t-xl overflow-hidden mb-4 ${achievement.certificateFile ? 'cursor-pointer' : ''}
                        ${achievement.category === 'reports' && achievement.coverImage ? 'h-64' : ''}`}
                      onClick={() => achievement.certificateFile && handleCertificateClick(achievement)}
                    >
                      {achievement.coverImage ? (
                        <Image
                          src={achievement.coverImage}
                          alt={achievement.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : isImage ? (
                        <Image
                          src={achievement.certificateFile!}
                          alt={achievement.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="relative w-full h-48 rounded-t-xl overflow-hidden mb-4 flex items-center justify-center cursor-pointer" onClick={() => handleCertificateClick(achievement)}>
                          <Image
                            src="/placeholder_pdf_1786536404120.jpg"
                            alt="PDF Certificate"
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-500 dark:text-gray-400 bg-black/30 py-1">Click to view</p>
                        </div>
                      )}
                      {achievement.category === 'reports' && achievement.coverImage && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-lg drop-shadow-lg">{achievement.title}</h3>
                          </div>
                        </div>
                      )}
                      {!achievement.coverImage && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </div>
                  )}

                  <div className="flex flex-col flex-1 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg overflow-hidden h-10 w-10 flex items-center justify-center relative">
                          <AchievementLogo
                            achievement={achievement}
                            Icon={Icon}
                          />
                        </div>
                        <Badge variant="primary" className="ml-2">
                          {categoryLabels[achievement.category]}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{achievement.title}</h3>
                    {achievement.organization && (
                      <p className="text-primary-600 dark:text-primary-400 font-medium mb-2">
                        {achievement.organization}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {formatDate(achievement.date)}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 flex-1 text-sm">
                      {achievement.description}
                    </p>

                    <div className="flex items-center gap-3 mt-auto">
                      {achievement.category === 'reports' ? (
                        <button
                          onClick={() => handleCertificateClick(achievement)}
                          className="px-4 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-bold hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          Read Full Report
                        </button>
                      ) : (
                        achievement.certificateFile && (
                          <button
                            onClick={() => handleCertificateClick(achievement)}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            View Certificate
                          </button>
                        )
                      )}

                      {achievement.verificationUrl && (
                        <a
                          href={achievement.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline ml-auto"
                        >
                          Verify
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
{activeCategory === 'certification' && filteredAchievements.length > 4 && (
  <div className="text-center py-8">
    <button
      onClick={() => setShowAllCertifications(!showAllCertifications)}
      className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:border-primary-500 hover:text-primary-600 transition font-semibold"
    >
      {showAllCertifications ? '← Show Less' : 'See All Certifications →'}
    </button>
  </div>
)}




        {/* Certificate Modal */}
        <CertificateModal
          achievement={selectedCertificate}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Report Viewer Modal */}
        <ReportViewerModal
          achievement={selectedReport}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      </div>
    </section >
  )
}

function ReportViewerModal({ achievement, isOpen, onClose }: { achievement: Achievement | null, isOpen: boolean, onClose: () => void }) {
  if (!achievement || !isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{achievement.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {achievement.organization ? `${achievement.organization} • ` : ''}
                {formatDate(achievement.date)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ExternalLink className="w-5 h-5 text-gray-500" /> {/* Using ExternalLink as close icon proxy or just X if imported */}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {achievement.coverImage && (
            <div className="w-full h-64 md:h-80 relative rounded-xl overflow-hidden mb-8">
              <Image
                src={achievement.coverImage}
                alt={achievement.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white shadow-sm">{achievement.title}</h1>
              </div>
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none">
            {achievement.content ? (
              <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                {achievement.content}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p>No text content available for this report.</p>
                {achievement.certificateFile && (
                  <a
                    href={achievement.certificateFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Download Original PDF
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

