using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using JetBench.Api.Models.Engines;
using JetBench.Api.Models.Accounts;


namespace JetBench.Api.Data
{
    public class JetBenchContext : IdentityDbContext<ApplicationUser>
    {
        public JetBenchContext(DbContextOptions<JetBenchContext> options) : base(options) { }

        public DbSet<Engine> Engines { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Engine>().HasIndex(e => e.Serial).IsUnique();
        }
    }
}