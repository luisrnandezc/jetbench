using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace JetBench.Api.Models.Accounts
{
    public class ApplicationUser : IdentityUser
    {
        [Required][PersonalData]
        public required string FullName { get; set; }

        [PersonalData]
        public string? CompanyName { get; set; }

        [Required][PersonalData]
        public required string JobRole { get; set; }
    }
}