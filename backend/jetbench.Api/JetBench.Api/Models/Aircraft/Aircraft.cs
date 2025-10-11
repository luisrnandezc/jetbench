using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using JetBench.Api.Models.Engines;

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

    [Index(nameof(Serial), nameof(Registration), IsUnique = true)]
    public class Aircraft
    {
        #region model fields

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

        #endregion model fields

        #region model methods

        public override string ToString()
        {
            return $"{Manufacturer} {Model} {Registration}";
        }

        #endregion model methods
    }

    public class AircraftFlightRecord
    {
        #region model fields

        public int Id { get; set; }

        // Aircraft relationship
        [Required]
        public int AircraftId { get; set; }
        public required Aircraft Aircraft { get; set; }

        // Flight date
        public DateTime FlightDate { get; set; } = DateTime.UtcNow;

        // Flight hours
        [Precision(3, 1)]
        [Range(0, 50, ErrorMessage = "Flight hours must be between 0 h and 50 h")]
        public double? FlightHours { get; set; } = 0.0;

        // Pressure Altitude (ft)
        [Range(0, 70000, ErrorMessage = "PA must be between 0 ft and 70000 ft")]
        public int PressAltitude { get; set; }

        // Outside Air Temperature OAT (°C)
        [Precision(3, 1)]
        [Range(-100, 100, ErrorMessage = "OAT must be between -100 °C and 100 °C")]
        public decimal OutsideAirTemp { get; set; }

        // Indicated Airspeed (kts)
        [Range(0, 1000, ErrorMessage = "IAS must be between 0 kts and 1000 kts")]
        public int? IndicatedAirSpeed { get; set; }

        // Mach number
        [Precision(2, 1)]
        [Range(0, 3, ErrorMessage = "Mach number must be between 0 and 3")]
        public decimal? MachNumber { get; set; }

        #endregion model fields

        #region model methods

        public List<EngineFlightRecord> EngineRecords { get; set; } = new();

        public override string ToString()
        {
            return $"{Aircraft.Registration} {FlightDate} {FlightHours}";
        }

        #endregion model methods
    }
}

