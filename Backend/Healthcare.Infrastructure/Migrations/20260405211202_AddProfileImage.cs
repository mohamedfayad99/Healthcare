using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Healthcare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "PositionLogs",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "PositionLogs",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "PositionLogs",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Patients",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Patients",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Patients",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "ProfileImage",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfileImage",
                table: "Users");

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
        }
    }
}
