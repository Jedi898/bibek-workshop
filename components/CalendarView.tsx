'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarEvent } from '@/types';

interface CalendarViewProps {
  projectId: string;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop: (eventId: string, newStart: Date, newEnd: Date) => void;
}

const eventColors = {
  shoot: '#10b981',
  meeting: '#3b82f6',
  deadline: '#ef4444',
  rehearsal: '#8b5cf6',
  other: '#6b7280'
};

export default function CalendarView({
  projectId,
  events,
  onEventClick,
  onEventDrop
}: CalendarViewProps) {
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');

  const formattedEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    color: eventColors[event.type],
    extendedProps: event
  }));

  const handleEventClick = (clickInfo: any) => {
    onEventClick(clickInfo.event.extendedProps);
  };

  const handleEventDrop = (dropInfo: any) => {
    const eventId = dropInfo.event.id;
    const newStart = dropInfo.event.start;
    const newEnd = dropInfo.event.end;
    onEventDrop(eventId, newStart, newEnd);
  };

  return (
    <div className="h-[600px] bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {['dayGridMonth', 'timeGridWeek', 'timeGridDay'].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view as any)}
                className={`px-3 py-1 rounded ${
                  currentView === view
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {view.replace('timeGrid', '').replace('dayGrid', '').charAt(0).toUpperCase() +
                 view.replace('timeGrid', '').replace('dayGrid', '').slice(1)}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Event
          </button>
        </div>
      </div>
      <div className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          events={formattedEvents}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          editable={true}
          selectable={true}
          headerToolbar={false}
          height="100%"
        />
      </div>
    </div>
  );
}
