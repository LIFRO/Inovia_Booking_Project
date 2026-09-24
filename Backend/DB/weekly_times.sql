CREATE OR REPLACE FUNCTION
public.weekly_times(
    p_input_date date
)
RETURNS TABLE(
    day_number int,
    available_date date,
    available_time time
)
LANGUAGE plpgsql
AS $$
DECLARE
    current_date date;
    exception_row public.available_exceptions%ROWTYPE;
BEGIN
    FOR current_date IN
        SELECT day_date
        FROM generate_series(
            date_trunc('week', p_input_date)::DATE,
            date_trunc('week', p_input_date)::DATE + 6,
            interval '1 day'
        ) AS dates(day_date)
    LOOP
        SELECT ae.*
        INTO exception_row
        FROM public.available_exceptions AS ae
        WHERE ae.date = current_date;

        IF FOUND THEN
            IF exception_row.is_available = false THEN
                CONTINUE;
            END IF;

            RETURN QUERY
            SELECT
                extract(isodow FROM current_date)::int,
                current_date,
                slots.slot::time
            FROM generate_series(
                current_date + exception_row.start_time,
                current_date + exception_row.end_time - interval '1 hour',
                interval '1 hour'
            ) AS slots(slot);

        ELSE
            RETURN QUERY
            SELECT
                extract(isodow FROM current_date)::int,
                current_date,
                slots.slot::time
            FROM public.available_times AS at
            CROSS JOIN LATERAL generate_series(
                current_date + at.start_time,
                current_date + at.end_time - interval '1 hour',
                interval '1 hour'
            ) AS slots(slot)
            WHERE at.weekday = extract(isodow FROM current_date)::int;
        END IF;
    END LOOP;
END;
$$;
