using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConferenceApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddConferenceTimezone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Timezone",
                table: "Conferences",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Timezone",
                table: "Conferences");
        }
    }
}
