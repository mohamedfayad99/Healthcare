using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Healthcare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Age = table.Column<int>(type: "int", nullable: false),
                    BedNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Department = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MobilityStatus = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PositionLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    TargetPosition = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ChangedByUserId = table.Column<int>(type: "int", nullable: false),
                    IsMissed = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PositionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PositionLogs_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PositionLogs_Users_ChangedByUserId",
                        column: x => x.ChangedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Patients",
                columns: new[] { "Id", "Age", "BedNumber", "Department", "FullName", "MobilityStatus" },
                values: new object[,]
                {
                    { 1, 58, "12", "العناية المركزة", "سعد عطية", "غير قادر على الحركة" },
                    { 2, 45, "8", "العناية المركزة", "محمد علي", "غير قادر على الحركة" },
                    { 3, 62, "15", "العناية المركزة", "فاطمة أحمد", "غير قادر على الحركة" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Role", "Username" },
                values: new object[] { 1, "Nurse", "hamid" });

            migrationBuilder.InsertData(
                table: "PositionLogs",
                columns: new[] { "Id", "ChangedAt", "ChangedByUserId", "IsMissed", "PatientId", "TargetPosition" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 4, 4, 13, 2, 6, 982, DateTimeKind.Utc).AddTicks(418), 1, false, 1, "على الظهر" },
                    { 2, new DateTime(2026, 4, 4, 13, 57, 6, 982, DateTimeKind.Utc).AddTicks(424), 1, false, 2, "الجانب الأيمن" },
                    { 3, new DateTime(2026, 4, 4, 10, 2, 6, 982, DateTimeKind.Utc).AddTicks(428), 1, false, 3, "الجانب الأيسر" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_PositionLogs_ChangedByUserId",
                table: "PositionLogs",
                column: "ChangedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PositionLogs_PatientId",
                table: "PositionLogs",
                column: "PatientId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PositionLogs");

            migrationBuilder.DropTable(
                name: "Patients");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
