using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class CleanBookingModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResourceName",
                table: "Bookings");

            migrationBuilder.RenameColumn(
                name: "EndTime",
                table: "Bookings",
                newName: "DurationHours");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "Bookings");

            migrationBuilder.AddColumn<TimeOnly>(
                name: "StartTime",
                table: "Bookings",
                type: "time without time zone",
                nullable: false,
                defaultValue: new TimeOnly(0, 0));

            migrationBuilder.DropColumn(
                name: "Date",
                table: "Bookings");

            migrationBuilder.AddColumn<DateOnly>(
                name: "Date",
                table: "Bookings",
                type: "date",
                nullable: false,
                defaultValue: DateOnly.FromDateTime(DateTime.UtcNow));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DurationHours",
                table: "Bookings",
                newName: "EndTime");

            migrationBuilder.AlterColumn<int>(
                name: "StartTime",
                table: "Bookings",
                type: "integer",
                nullable: false,
                oldClrType: typeof(TimeOnly),
                oldType: "time without time zone");

            migrationBuilder.AlterColumn<int>(
                name: "Date",
                table: "Bookings",
                type: "integer",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AddColumn<string>(
                name: "ResourceName",
                table: "Bookings",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
