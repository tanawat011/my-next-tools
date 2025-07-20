import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DataTable } from '@/components/data-table'
import { SectionCards } from '@/components/section-cards'
import dashboard from '@/data/dashboard.json'

export const DashboardView = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6">
          <SectionCards />
          <ChartAreaInteractive />
          <DataTable data={dashboard} />
        </div>
      </div>
    </div>
  )
}
