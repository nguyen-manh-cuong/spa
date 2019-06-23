using System.Data;
using System.IO;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Viettel.Infrastructure;
using Viettel.Infrastructure.Interception;

namespace SHCServer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            IDbCommandInterceptor interceptor = new DbCommandInterceptor();
            DbConfiguration.UseInterceptors(interceptor);

            RegisterMappingType();

            BuildWebHost(args).Build().Run();
        }

        public static IWebHostBuilder BuildWebHost(string[] args)
        {
            {
                var config = new ConfigurationBuilder().SetBasePath(Directory.GetCurrentDirectory())
                                                       .AddJsonFile("appsettings.json", true)
                                                       .Build();


                return WebHost.CreateDefaultBuilder(args)
                              .UseConfiguration(config)
                              .UseIISIntegration()
                              .UseUrls($"http://*:{config.GetValue("Application:Port", 9008)}")
                              .UseStartup<Startup>();
            }
        }

        private static void RegisterMappingType()
        {
            DbConfiguration.UseMappingType(new StringMappingType());
            DbConfiguration.UseMappingType(new MappingType<int>(DbType.Int32));
            DbConfiguration.UseMappingType(new MappingType<long>(DbType.Int64));
            DbConfiguration.UseMappingType(new MappingType<short>(DbType.Int16));
            DbConfiguration.UseMappingType(new MappingType<byte>(DbType.Byte));
            DbConfiguration.UseMappingType(new MappingType<double>(DbType.Double));
            DbConfiguration.UseMappingType(new MappingType<float>(DbType.Single));
            DbConfiguration.UseMappingType(new MappingType<decimal>(DbType.Decimal));
        }
    }
}