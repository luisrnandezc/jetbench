using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JetBench.Api.Models.Aircraft
{
    public enum AircraftManufacturer
    {
        [Display(Name = "Cessna Aircraft")]
        CS, // Cessna Aircraft
        [Display(Name = "Beechcraft Aircraft")]
        BC, // Beechcraft Aircraft
        [Display(Name = "Bombardier")]
        BD, // Bombardier
        [Display(Name = "Daher")]
        DH, // Daher
        [Display(Name = "Dassault Aviation")]
        DS, // Dassault Aviation
        [Display(Name = "Embraer")]
        EB, // Embraer
        [Display(Name = "Gulfstream Aerospace")]
        GS, // Gulfstream Aerospace
        [Display(Name = "Pilatus Aircraft")]
        PL, // Pilatus Aircraft
        [Display(Name = "Textron Aviation")]
        TX, // Textron Aviation
        [Display(Name = "Other")]
        OT, // Other
    }

    public enum AircraftType
    {
        [Display(Name = "Single Engine Turboprop")]
        ST, // Single turboprop
        [Display(Name = "Twin Engine Turboprop")]
        TT, // Twin turboprop
        [Display(Name = "Single Engine Jet")]
        SJ, // Single jet
        [Display(Name = "Twin Engine Jet")]
        TJ, // Twin jet
        [Display(Name = "Three Engine Jet")]
        JJ, // Trijet
        [Display(Name = "Other")]
        OT, // Other
    }

    [Index(nameof(Serial), IsUnique = true)]
    public class Aircraft
    {
        public int Id { get; set; }

        [Required]
        public AircraftManufacturer Manufacturer { get; set; } = AircraftManufacturer.OT;

        [Required]
        public AircraftType Type { get; set; } = AircraftType.OT;

        [Required]
        [MaxLength(255)]
        public string Model { get; set; } = "";

        [Required]
        [MaxLength(255)]
        public string Serial { get; set; } = "";

        [Required]
        [MaxLength(50)]
        public string Registration { get; set; } = "";

        public override string ToString()
        {
            return $"{Manufacturer} {Model} {Registration}";
        }
    }
}

