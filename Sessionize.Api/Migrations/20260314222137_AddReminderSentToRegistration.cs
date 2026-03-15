using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sessionize.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReminderSentToRegistration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ReminderSent",
                table: "Registrations",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReminderSent",
                table: "Registrations");
        }
    }
}
