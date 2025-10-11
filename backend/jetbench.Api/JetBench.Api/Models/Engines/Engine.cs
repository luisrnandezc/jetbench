using System.ComponentModel.DataAnnotations;
using JetBench.Api.Models.Aircraft;
using Microsoft.EntityFrameworkCore;
using AircraftModels = JetBench.Api.Models.Aircraft;


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
        #region model fields

        public int Id { get; set; }

        [Required]
        public int? AircraftId { get; set; }
        public AircraftModels.Aircraft? Aircraft { get; set; }

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

        [Range(0.0, 999999.9)]
        public decimal TimeSinceNew { get; set; } = 0.0m;

        [Range(0, 1000000)]
        public int CyclesSinceNew { get; set; } = 0;

        [Range(0.0, 99999.9)]
        public decimal TimeSinceOverhaul { get; set; } = 0.0m;

        [Range(0, 100000)]
        public int CyclesSinceOverhaul { get; set; } = 0;

        [Range(0.0, 9999.9)]
        public decimal TimeBetweenOverhauls { get; set; } = 3500.0m;

        public List<EngineFlightRecord> FlightRecords { get; set; } = new();

        #endregion model fields

        #region model methods

        public override string ToString()
        {
            return $"{Manufacturer} {Model} {Serial}";
        }

        #endregion model methods
    }

    public class EngineFlightRecord
    {
        #region model fields

        public int Id { get; set; }

        // Engine relationship
        [Required]
        public int EngineId { get; set; }
        public required Engine Engine { get; set; }

        // Aircraft Flight Data relationship
        [Required]
        public int AircraftFlightRecordId { get; set; }
        public required AircraftFlightRecord AircraftFlightRecord { get; set; }

        // Low pressure compressor speed (%)
        [Precision(4, 1)]
        [Range(0, 110, ErrorMessage="N1 must be between 0 % and 110 %")]
        public double? SpeedN1 { get; set; }

        // High pressure compressor speed (%)
        [Precision(4, 1)]
        [Range(0, 110, ErrorMessage = "N2 must be between 0 % and 110 %")]
        public double? SpeedN2 { get; set; }

        // Engine Pressure Ratio
        [Precision(3, 1)]
        [Range(0, 100, ErrorMessage = "EPR must be between 0 and 100")]
        public double? EnginePR { get; set; }

        // Interstage Turbine Temperature ITT (°C)
        [Precision(5, 1)]
        [Range(0, 10000, ErrorMessage = "ITT must be between 0 °C and 10000 °C")]
        public decimal? InterstageTT { get; set; }

        // Fuel Flow (kg/h)
        [Range(0, 50000, ErrorMessage = "FF must be between 0 kg/h and 50000 kg/h")]
        public int? EngineFF { get; set; }

        // Oil Pressure (psi)
        [Range(0, 1000, ErrorMessage = "Oil Pressure must be between 0 psi and 1000 psi")]
        public int? OilPress { get; set; }

        // Oil Temperature (°C)
        [Range(0, 500, ErrorMessage = "Oil Temperature must be between 0 °C and 500 °C")]
        public int? OilTemp { get; set; }

        // Total oil added for this flight (quarts)
        [Range(0, 50, ErrorMessage = "Oil added must be between 0 quarts and 50 quarts")]
        public int? OilAdded { get; set; }

        // Engine vibration (in/s)
        [Precision(3, 2)]
        [Range(0, 10, ErrorMessage = "Engine vibration must be between 0 in/s and 10 in/s")]
        public decimal? EngineVib { get; set; }

        #endregion model fields

        #region model methods

        public override string ToString()
        {
            return $"{Engine.Serial} {AircraftFlightRecord.FlightDate} {AircraftFlightRecord.FlightHours}";
        }

        // TODO: Implement normalization methods for the temperature and pressure.

        #endregion model methods

    }
}
