using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
namespace JetBench.Api.Models.Engines
{

    public enum EngineManufacturer
    {
        [Display(Name = "Honeywell")]
        HW, // Honeywell
        [Display(Name = "Rolls-Royce")]
        RR, // Rolls-Royce
        [Display(Name = "General-Electric")]
        GE, // General Electric
        [Display(Name = "Pratt & Whitney")]
        PW, // Pratt & Whitney
        [Display(Name = "Williams")]
        WL, // Williams
        [Display(Name = "Other")]
        OT, // Other
    }

    public enum EngineType
    {
        [Display(Name = "Turbojet")]
        TJ, // Turbojet
        [Display(Name = "Turbofan")]
        TF, // Turbofan
        [Display(Name = "Turboprop")]
        TP, // Turboprop
        [Display(Name = "Turboshaft")]
        TS, // Turboshaft
        [Display(Name = "Other")]
        OT, // Other
    }

    [Index(nameof(Serial), IsUnique = true)]
    public class Engine
    {
        public int Id { get; set; }

        [Required]
        public EngineManufacturer Manufacturer { get; set; } = EngineManufacturer.OT;

        [Required]
        public EngineType Type { get; set; } = EngineType.OT;

        [Required]
        [MaxLength(255)]
        public string Model { get; set; } = "";

        [Required]
        [MaxLength(255)]
        public string Serial { get; set; } = "";

        // Current Life Status
        [Range(0.0, 999999.9)]
        public decimal TimeSinceNew { get; set; } = 0.0m;

        [Range(0, 1000000)]
        public int CyclesSinceNew { get; set; } = 0;

        [Range(0.0, 99999.9)]
        public decimal TimeSinceOverhaul { get; set; } = 0.0m;

        [Range(0, 100000)]
        public int CyclesSinceOverhaul { get; set; } = 0;

        // Maintenance Limits
        [Range(0.0, 9999.9)]
        public decimal TimeBetweenOverhauls { get; set; } = 3500.0m;

        public override string ToString()
        {
            return $"{Manufacturer} {Model} {Serial}";
        }
    }
}
