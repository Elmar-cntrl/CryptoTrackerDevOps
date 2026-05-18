using Microsoft.EntityFrameworkCore;
using CryptoTracker.Api.Entities;

namespace CryptoTracker.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Token> Tokens { get; set; }
    public DbSet<UserTokenSetting> UserTokenSettings { get; set; }
    public DbSet<PriceSnapshot> PriceSnapshots { get; set; }
    public DbSet<Trade> Trades { get; set; }
    public DbSet<SpreadAlert> SpreadAlerts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<UserTokenSetting>()
            .HasOne(x => x.User)
            .WithMany(x => x.TokenSettings)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserTokenSetting>()
            .HasOne(x => x.Token)
            .WithMany(x => x.UserSettings)
            .HasForeignKey(x => x.TokenId)
            .OnDelete(DeleteBehavior.Cascade);

        //польз не может дважды добавить одну и туже монету
        modelBuilder.Entity<UserTokenSetting>()
            .HasIndex(x => new { x.UserId, x.TokenId })
            .IsUnique();
    }
}