// Date = YYYYMMDD (t.ex. 20260911), time = HHmm (t.ex. 900, 1330)
export function toZonedDateTime(dateInt: number, timeInt: number): string {
    const year = Math.floor(dateInt / 10000)
    const month = Math.floor((dateInt % 10000) / 100)
    const day = dateInt % 100

    const hour = Math.floor(timeInt / 100)
    const minute = timeInt % 100

    const pad = (n: number) => n.toString().padStart(2, '0')

    return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+02:00[Europe/Stockholm]`
}

/**
 * Converts backend DateOnly and TimeOnly strings into a Stockholm zoned time.
 */
export function toZonedDateTimeFromStrings(
    dateStr: string,
    timeStr: string
): Temporal.ZonedDateTime {
    // dateStr: "2026-09-17"
    // timeStr: "10:00:00" or "10:00"
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    return globalThis.Temporal.ZonedDateTime.from({
        timeZone: 'Europe/Stockholm',
        year,
        month,
        day,
        hour,
        minute,
        second: 0
    });
}