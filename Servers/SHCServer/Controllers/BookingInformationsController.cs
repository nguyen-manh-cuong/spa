using System;
using System.Collections.Generic;
using SHCServer.Models;
using SHCServer.ViewModels;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Viettel;
using Viettel.MySql;

namespace SHCServer.Controllers
{
    public class BookingInformationsController : BaseController
    {
        private readonly string _connectionString;

        public BookingInformationsController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));

            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _excep = new FriendlyException();
        }
        

        [HttpPost]
        [Route("api/bookinginformations")]
        public IActionResult Create([FromBody] BookingInformationsInputViewModel bi)
        {
            var result = _context.Insert(new BookingInformations(bi));

            return Json(new ActionResultDto { Result = result });
        }
    }
}