using System.Data;
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
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            return WebHost
                   .CreateDefaultBuilder(args)
                   .ConfigureAppConfiguration(config =>
                   {
                       config.AddJsonFile("appsettings.json");
                       config.AddEnvironmentVariables();
                   })
                   .UseIISIntegration()
                   .UseKestrel(c => c.AddServerHeader = false)
                   .UseStartup<Startup>()
                   .UseUrls("http://127.0.0.1:9008")
                   .Build();
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