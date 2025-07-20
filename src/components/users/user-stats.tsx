'use client'

import { Users, UserCheck, UserX, Clock } from 'lucide-react'

import { StatsCard, StatsGrid } from '@/components/shared/stats-card'
import { useUserStats } from '@/hooks/use-users'

export function UserStats() {
  const { data: stats, isLoading, error } = useUserStats()

  if (error) {
    return null
  }

  if (isLoading) {
    return (
      <StatsGrid>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCard key={i} title="" value="" isLoading={true} />
        ))}
      </StatsGrid>
    )
  }

  const statsData = [
    {
      title: 'Total Users',
      value: stats?.total || 0,
      icon: Users,
      description: 'All registered users',
      color: 'text-blue-600',
    },
    {
      title: 'Active Users',
      value: stats?.active || 0,
      icon: UserCheck,
      description: 'Currently active users',
      color: 'text-green-600',
    },
    {
      title: 'Inactive Users',
      value: stats?.inactive || 0,
      icon: UserX,
      description: 'Deactivated users',
      color: 'text-red-600',
    },
    {
      title: 'Signed in Today',
      value: stats?.signedInToday || 0,
      icon: Clock,
      description: 'Users who signed in today',
      color: 'text-orange-600',
    },
  ]

  return (
    <StatsGrid>
      {statsData.map(stat => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          iconColor={stat.color}
        />
      ))}
    </StatsGrid>
  )
}
