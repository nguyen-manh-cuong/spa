using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using SHCServer.Models;
using SHCServer.ViewModels;
using System;
using System.Net;
using System.Net.Mail;
using Viettel.MySql;

namespace SHCServer.Controllers
{
    public class UsersController : BaseController
    {
        private readonly string _connectionString;
        string _newPassword;
        public UsersController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("MdmConnection")));
            _connectionString = configuration.GetConnectionString("MdmConnection");
            _excep = new FriendlyException();
        }
    }
}