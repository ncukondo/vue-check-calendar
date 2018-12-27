interface ICalendarEvent {
  getSummary(): string;
  getStartDate(): Date;
}

class CalendarEvent implements ICalendarEvent {
  private summary: string = '';
  private date: Date = new Date();
  getSummary(): string {
    return this.summary;
  }
  getStartDate(): Date {
    return this.date;
  }

  setSummary(summary: string) {
    this.summary = summary;
  }
  setStartDate(date: Date) {
    this.date = date;
  }
}

export default function parseIcal(text: string): Array<ICalendarEvent> {
  const lines = text.split(/\r?\n/);
  const result = new Array<ICalendarEvent>();
  let currentEvent: CalendarEvent | null = null;
  for (const line of lines) {
    if (line.includes('BEGIN:VEVENT')) {
      currentEvent = new CalendarEvent();
    } else if (currentEvent)
      if (line.includes('DTSTART;VALUE=DATE')) {
        let dateString = line.split(':')[1];
        let comps = /^(\d{4})(\d{2})(\d{2})$/.exec(dateString);
        //console.log(comps);
        if (comps) {
          currentEvent.setStartDate(
            new Date(parseInt(comps[1]), parseInt(comps[2]) - 1, parseInt(comps[3]))
          );
        }
      } else if (line.includes('SUMMARY:')) {
        let summaryString = line.split(':')[1];
        currentEvent.setSummary(summaryString);
      } else if (line.includes('END:VEVENT')) {
        result.push(currentEvent);
        currentEvent = null;
      }
  }
  return result;
}
