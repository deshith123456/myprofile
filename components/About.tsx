'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Code,
  Target,
  ShieldAlert,
  Database,
  Terminal,
  Activity,
  Bug,
  Search,
  Braces,
  GitBranch,
  Command
} from 'lucide-react'
import { Skill, Profile } from '@/data/types'

const iconMap: { [key: string]: any } = {
  'activity': Activity,
  'bug': Bug,
  'search': Search,
  'database': Database,
  'terminal': Terminal,
  'shield-alert': ShieldAlert,
  'code': Code,
  'command': Command,
  'braces': Braces,
  'git-branch': GitBranch,
  'target': Target,
  'shield': Shield,
}

function SkillCard({ skill }: { skill: Skill }) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)

  const isBrand = skill.isBrandIcon && skill.icon
  const brandIconUrl = skill.customIconUrl || (isBrand ? `https://cdn.simpleicons.org/${skill.icon}/${skill.brandColor || '666666'}` : null)

  useEffect(() => {
    if (!brandIconUrl) {
      setImageStatus('error')
      return;
    }

    if (brandIconUrl === currentUrl && imageStatus === 'loaded') return;

    if (brandIconUrl !== currentUrl) {
      setCurrentUrl(brandIconUrl)
      setImageStatus('loading')
    }

    const img = new Image()
    img.src = brandIconUrl
    img.onload = () => {
      if (img.src === brandIconUrl) setImageStatus('loaded')
    }
    img.onerror = () => {
      if (img.src === brandIconUrl) setImageStatus('error')
    }

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [brandIconUrl, currentUrl, imageStatus])

  const FallbackIcon = skill.icon && iconMap[skill.icon] ? iconMap[skill.icon] : Shield

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all duration-300"
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 p-2">
        {imageStatus === 'loaded' && brandIconUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={brandIconUrl}
            alt={skill.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <FallbackIcon className={`w-full h-full text-primary-500 ${imageStatus === 'loading' && brandIconUrl ? 'opacity-50 animate-pulse' : ''}`} />
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{skill.name}</span>
          <span className="text-[10px] font-black text-primary-500">{skill.proficiency}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: skill.proficiency / 100 }}
            transition={{ duration: 1.5, ease: "circOut" }}
            viewport={{ once: true }}
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 origin-left will-change-transform"
          />
        </div>
      </div>
    </motion.div >
  )
}

export function About({ skills, profile }: { skills: Skill[], profile: Profile }) {
  const skillsData = skills
  const [showAllSecurity, setShowAllSecurity] = useState(false)
  const [showAllDev, setShowAllDev] = useState(false)
  const LIMIT = 4

  return (
    <section id="about" className="py-24 bg-[#F8FAFC] dark:bg-[#030711] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <span className="px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-widest border border-primary-500/20 mb-4 inline-block">
            My Arsenal
          </span>
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-gray-900 dark:text-white">
            Technical <span className="gradient-text">Mastery</span>
          </h2>
          <div className="max-w-4xl mx-auto space-y-6 text-center">
            {/* Short Summary */}
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
              {profile.bio}
            </p>

            {/* Executive Summary */}
            {profile.longBio && (
              <div className="text-lg text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                {profile.longBio}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Security Stack Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="p-3 rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Security Stack</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {skillsData.filter(s => s.category === 'security-tools')
                .slice(0, showAllSecurity ? undefined : LIMIT)
                .map(skill => (
                  <SkillCard key={skill.name} skill={skill} />
                ))}
            </div>
            {skillsData.filter(s => s.category === 'security-tools').length > LIMIT && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowAllSecurity(!showAllSecurity)}
                  className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:border-primary-500 hover:text-primary-600 transition font-semibold text-sm"
                >
                  {showAllSecurity ? '← Show Less' : 'See All →'}
                </button>
              </div>
            )}
          </motion.div>

          {/* Dev & Scripting Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="p-3 rounded-2xl bg-secondary-500 text-white shadow-lg shadow-secondary-500/20">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Dev & Scripting</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {skillsData.filter(s => s.category === 'programming')
                .slice(0, showAllDev ? undefined : LIMIT)
                .map(skill => (
                  <SkillCard key={skill.name} skill={skill} />
                ))}
            </div>
            {skillsData.filter(s => s.category === 'programming').length > LIMIT && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowAllDev(!showAllDev)}
                  className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:border-primary-500 hover:text-primary-600 transition font-semibold text-sm"
                >
                  {showAllDev ? '← Show Less' : 'See All →'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
