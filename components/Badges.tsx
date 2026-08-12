'use client'

import { Badge } from '@/data/types'
import { motion } from 'framer-motion'

export function Badges({ badges }: { badges: Badge[] }) {
    if (!badges) return null

    const validBadges = badges.filter(b => b.image && b.image.trim() !== '')

    if (validBadges.length === 0) return null

    const doubledBadges = [...validBadges, ...validBadges]

    return (
        <section className="py-12 bg-gray-50 dark:bg-[#030711] border-t border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Digital Credentials
                </h3>
            </div>

            <div className="relative w-full overflow-hidden mask-linear-fade py-4">
                <motion.div
                    className="flex gap-6 w-max px-6"
                    animate={{ x: '-50%' }}
                    initial={{ x: 0 }}
                    transition={{
                        repeat: Infinity,
                        repeatType: 'loop',
                        duration: Math.max(25, validBadges.length * 3.5),
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
        </section>
    )
}
