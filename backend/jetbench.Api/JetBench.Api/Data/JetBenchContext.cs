using Microsoft.EntityFrameworkCore;
using JetBench.Api.Models.Engines;

namespace JetBench.Api.Data
{
    public class JetBenchContext : DbContext
    {
        public JetBenchContext(DbContextOptions<JetBenchContext> options) : base(options)
        {

        }

        public DbSet<Engine> Engines { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Engine>().HasIndex(e => e.Serial).IsUnique();
        }
    }
}
