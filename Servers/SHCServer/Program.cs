using System;
using System.Collections.Generic;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Viettel.Infrastructure;
using Viettel.Infrastructure.Interception;
using System.Data;
using SHCServer.Models;

namespace SHCServer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //SendMail.Start();
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
                   .UseStartup<Startup>()
                   .UseUrls("http://127.0.0.1:9008")
                   .Build();
        }

        static void RegisterMappingType()
        {
            DbConfiguration.UseMappingType(new StringMappingType());
            DbConfiguration.UseMappingType(new MappingType<int>(DbType.Int32));
            DbConfiguration.UseMappingType(new MappingType<long>(DbType.Int64));
            DbConfiguration.UseMappingType(new MappingType<Int16>(DbType.Int16));
            DbConfiguration.UseMappingType(new MappingType<byte>(DbType.Byte));
            DbConfiguration.UseMappingType(new MappingType<double>(DbType.Double));
            DbConfiguration.UseMappingType(new MappingType<float>(DbType.Single));
            DbConfiguration.UseMappingType(new MappingType<decimal>(DbType.Decimal));
        }
    }
}
