using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
public partial class AddBookingFunctionTables : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
            migrationBuilder.Sql("""
                CREATE TABLE IF NOT EXISTS public.available_times (
                    id SERIAL PRIMARY KEY,
                    weekday INT NOT NULL,
                    start_time TIME NOT NULL,
                    end_time TIME NOT NULL
                );

                CREATE TABLE IF NOT EXISTS public.available_exceptions (
                    id SERIAL PRIMARY KEY,
                    date DATE NOT NULL,
                    is_available BOOLEAN NOT NULL,
                    start_time TIME,
                    end_time TIME
                );
            """);

            migrationBuilder.Sql("""
                INSERT INTO public.available_times (weekday, start_time, end_time)
                SELECT seed.weekday, seed.start_time, seed.end_time
                FROM (
                    VALUES
                        (1, TIME '08:00', TIME '18:00'),
                        (2, TIME '08:00', TIME '18:00'),
                        (3, TIME '08:00', TIME '18:00'),
                        (4, TIME '08:00', TIME '18:00'),
                        (5, TIME '08:00', TIME '18:00')
                ) AS seed(weekday, start_time, end_time)
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM public.available_times AS existing
                    WHERE existing.weekday = seed.weekday
                      AND existing.start_time = seed.start_time
                      AND existing.end_time = seed.end_time
                );
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
            migrationBuilder.Sql("""
                DROP TABLE IF EXISTS public.available_exceptions;
                DROP TABLE IF EXISTS public.available_times;
            """);
    }
}
}
