using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using JetBench.Api.Models.Engines;
using JetBench.Api.Models.Accounts;
using JetBench.Api.Models.Aircraft;


namespace JetBench.Api.Data
{
    public class JetBenchContext : IdentityDbContext<ApplicationUser>
    {
        public JetBenchContext(DbContextOptions<JetBenchContext> options) : base(options) { }

        public DbSet<Aircraft> Aircrafts { get; set; }
        public DbSet<Engine> Engines { get; set; } = null!;

        public DbSet<AircraftFlightRecord> AircraftFlightRecords { get; set; }

        public DbSet<EngineFlightRecord> EngineFlightRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Engine>()
                .HasOne(e => e.Aircraft)
                .WithMany()
                .HasForeignKey(e => e.AircraftId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<EngineFlightRecord>()
                .HasOne(efd => efd.AircraftFlightRecord)
                .WithMany(afd => afd.EngineRecords)
                .HasForeignKey(efd => efd.AircraftFlightRecordId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EngineFlightRecord>()
                .HasOne(efd => efd.Engine)
                .WithMany(e => e.FlightRecords)         
                .HasForeignKey(efd => efd.EngineId)      
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}