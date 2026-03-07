import SectionErrorBoundary from '../../SectionErrorBoundary'
import { EventTable } from '../EventTable'
import type { Event } from '../../../types/predict'

export function EventLibrarySection({ events }: { events: Event[] }) {
  return (
    <SectionErrorBoundary title="Event Library">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Event Library
            <span className="ml-2 text-xs text-gray-500">(latest 20)</span>
          </h2>
        </div>
        <div className="p-2">
          {events.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm">No events</p>
          ) : (
            <EventTable events={events} />
          )}
        </div>
      </section>
    </SectionErrorBoundary>
  )
}
