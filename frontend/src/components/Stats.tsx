import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Stats as StatsType } from '../types'

interface StatsProps {
  stats: StatsType | null
}

export function Stats({ stats }: StatsProps) {
  if (!stats) return null

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-8 px-4 bg-black">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className={cn(
              "rounded-2xl overflow-hidden shadow-lg bg-card border border-border",
              "bg-white/5 border-white/10 backdrop-blur-sm p-6 text-center"
            )}
          >
            <div className="text-4xl font-bold text-white mb-2">{stats.total_projects}</div>
            <div className="text-sm text-white/60 uppercase tracking-wide">Total Projects</div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className={cn(
              "rounded-2xl overflow-hidden shadow-lg bg-card border border-border",
              "bg-white/5 border-white/10 backdrop-blur-sm p-6 text-center"
            )}
          >
            <div className="text-4xl font-bold text-white mb-2">{stats.got_funding}</div>
            <div className="text-sm text-white/60 uppercase tracking-wide">Got Funding</div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className={cn(
              "rounded-2xl overflow-hidden shadow-lg bg-card border border-border",
              "bg-white/5 border-white/10 backdrop-blur-sm p-6 text-center"
            )}
          >
            <div className="text-4xl font-bold text-white mb-2">{stats.became_startups}</div>
            <div className="text-sm text-white/60 uppercase tracking-wide">Became Startups</div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className={cn(
              "rounded-2xl overflow-hidden shadow-lg bg-card border border-border",
              "bg-white/5 border-white/10 backdrop-blur-sm p-6 text-center"
            )}
          >
            <div className="text-4xl font-bold text-white mb-2">{stats.has_users}</div>
            <div className="text-sm text-white/60 uppercase tracking-wide">Has Users</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
