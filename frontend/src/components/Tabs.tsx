import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TabsProps {
  activeTab: 'all' | 'leaderboard' | 'success'
  onTabChange: (tab: 'all' | 'leaderboard' | 'success') => void
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  const tabs = [
    { id: 'all' as const, label: 'All Projects' },
    { id: 'leaderboard' as const, label: 'Leaderboard' },
    { id: 'success' as const, label: 'Success Stories' },
  ]

  return (
    <nav className="py-4 px-4 bg-black border-b border-white/10">
      <div className="container mx-auto max-w-7xl">
        <div className="flex gap-2 justify-center">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-6 py-3 rounded-2xl font-medium text-sm transition-all",
                "border backdrop-blur-sm",
                activeTab === tab.id
                  ? "bg-white/10 border-white/20 text-white shadow-lg"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>
    </nav>
  )
}
