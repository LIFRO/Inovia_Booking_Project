using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceDurationHoursWithEndTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DurationHours",
                table: "Bookings");

            migrationBuilder.AddColumn<TimeOnly>(
                name: "EndTime",
                table: "Bookings",
                type: "time without time zone",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "Bookings");

            migrationBuilder.AddColumn<int>(
                name: "DurationHours",
                table: "Bookings",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
