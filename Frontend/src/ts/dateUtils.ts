/**
 * Converts backend DateOnly and TimeOnly strings into a Stockholm zoned time.
 */
export function toZonedDateTimeFromStrings(
    dateStr: string,
    timeStr: string
): Temporal.ZonedDateTime {
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
