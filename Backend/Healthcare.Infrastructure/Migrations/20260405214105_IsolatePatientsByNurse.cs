using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Healthcare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class IsolatePatientsByNurse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Patients",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Patients");
        }
    }
}
