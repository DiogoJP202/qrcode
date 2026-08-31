using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QrPortal.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CustomerConsentAndBusinessPresentation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Stores",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BusinessHours",
                table: "Stores",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactEmail",
                table: "Stores",
                type: "character varying(254)",
                maxLength: 254,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "Stores",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstagramUrl",
                table: "Stores",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPresentationPublished",
                table: "Stores",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PresentationAbout",
                table: "Stores",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PresentationBackgroundColor",
                table: "Stores",
                type: "character varying(7)",
                maxLength: 7,
                nullable: false,
                defaultValue: "#F8FAFC");

            migrationBuilder.AddColumn<string>(
                name: "PresentationHeadline",
                table: "Stores",
                type: "character varying(160)",
                maxLength: 160,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PresentationPrimaryColor",
                table: "Stores",
                type: "character varying(7)",
                maxLength: 7,
                nullable: false,
                defaultValue: "#16A34A");

            migrationBuilder.AddColumn<string>(
                name: "PresentationStyle",
                table: "Stores",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: "modern");

            migrationBuilder.AddColumn<string>(
                name: "PresentationTextColor",
                table: "Stores",
                type: "character varying(7)",
                maxLength: 7,
                nullable: false,
                defaultValue: "#0F172A");

            migrationBuilder.AddColumn<string>(
                name: "WebsiteUrl",
                table: "Stores",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsApp",
                table: "Stores",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CardLayout",
                table: "MenuThemes",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: "grid");

            migrationBuilder.AddColumn<string>(
                name: "FontFamily",
                table: "MenuThemes",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: "sans");

            migrationBuilder.AddColumn<string>(
                name: "ImageStyle",
                table: "MenuThemes",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: "cover");

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "AspNetUsers",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "TermsAcceptances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TermsVersion = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    AcceptedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    Latitude = table.Column<decimal>(type: "numeric(6,3)", precision: 6, scale: 3, nullable: true),
                    Longitude = table.Column<decimal>(type: "numeric(6,3)", precision: 6, scale: 3, nullable: true),
                    AccuracyMeters = table.Column<decimal>(type: "numeric(8,0)", precision: 8, scale: 0, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TermsAcceptances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TermsAcceptances_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TermsAcceptances_UserId_TermsVersion",
                table: "TermsAcceptances",
                columns: new[] { "UserId", "TermsVersion" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TermsAcceptances");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "BusinessHours",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "ContactEmail",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "InstagramUrl",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "IsPresentationPublished",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "PresentationAbout",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "PresentationBackgroundColor",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "PresentationHeadline",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "PresentationPrimaryColor",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "PresentationStyle",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "PresentationTextColor",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "WebsiteUrl",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "WhatsApp",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "CardLayout",
                table: "MenuThemes");

            migrationBuilder.DropColumn(
                name: "FontFamily",
                table: "MenuThemes");

            migrationBuilder.DropColumn(
                name: "ImageStyle",
                table: "MenuThemes");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "AspNetUsers");
        }
    }
}
