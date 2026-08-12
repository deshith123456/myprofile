'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ProjectCard } from './ProjectCard'
import { ProjectModal } from './ProjectModal'
import { Badge } from '@/components/ui/Badge'
import { LayoutGrid, Globe, Smartphone, Code, Archive } from 'lucide-react'
import { Project } from '@/data/types'

type Filter = 'all' | 'web' | 'mobile' | 'opensource' | 'other'
type Sort = 'latest' | 'popular' | 'featured'

export function Projects({ projects: projectsData }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projectsData

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter((project) => project.category === filter)
    }

    // Default sort by latest
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [filter, projectsData])

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  // Get count for each category
  const getCategoryCount = (category: Filter) => {
    if (category === 'all') return projectsData.length
    return projectsData.filter(p => p.category === category).length
  }

  const filters: { label: string; value: Filter; icon: any }[] = [
    { label: 'All', value: 'all', icon: LayoutGrid },
    { label: 'Web Apps', value: 'web', icon: Globe },
    { label: 'Mobile', value: 'mobile', icon: Smartphone },
    { label: 'Open Source', value: 'opensource', icon: Code },
    { label: 'Other', value: 'other', icon: Archive },
  ]

  return (
    <section id="projects" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            My <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A collection of projects I&apos;ve worked on, showcasing my skills and experience
          </p>
        </motion.div>

        {/* Filters and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          {/* Filters - styled like Achievements */}
          <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <div className="flex gap-2 sm:flex-wrap sm:justify-center min-w-max sm:min-w-0">
              {filters.map((filterOption) => {
                const count = getCategoryCount(filterOption.value)
                const isActive = filter === filterOption.value
                const Icon = filterOption.icon

                return (
                  <button
                    key={filterOption.value}
                    onClick={() => setFilter(filterOption.value)}
                    className={`
                      group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                      ${isActive
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 border border-gray-200 dark:border-gray-700'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'}`} />
                    <span>{filterOption.label}</span>
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
            </div>
          </div>
        </motion.div>

        {/* Projects Grid - show limited with optional "See All" */}
        {(() => {
          const limit = 6;
          const showAll = showAllProjects || filteredAndSortedProjects.length <= limit;
          const displayed = showAll ? filteredAndSortedProjects : filteredAndSortedProjects.slice(0, limit);
          return (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayed.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProjectCard
                      project={project}
                      onClick={() => handleProjectClick(project)}
                    />
                  </motion.div>
                ))}
              </div>
              {!showAll && filteredAndSortedProjects.length > limit && (
                <div className="text-center py-8">
                  <button
                    onClick={() => setShowAllProjects(true)}
                    className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:border-primary-500 hover:text-primary-600 transition"
                  >
                    See All Projects
                  </button>
                </div>
              )}
            </>
          );
        })()}

        {filteredAndSortedProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No projects found for the selected filter.
            </p>
          </div>
        )}

        {/* Project Modal */}
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </section>
  )
}
