using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using SHCServer.Models;
using SHCServer.ViewModels;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.RegularExpressions;
using Viettel;
using Viettel.MySql;

namespace SHCServer.Controllers
{
    public class UsersAttachController : BaseController
    {
        private readonly string _connectionString;
        private readonly string _connectionStringSHC;

        public UsersAttachController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _contextmdmdb = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("MdmConnection")));
            _connectionString = configuration.GetConnectionString("MdmConnection");
            _excep = new FriendlyException();

            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _connectionStringSHC = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpGet]
        [Route("api/users-attach")]
        public IActionResult Get(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<UsersAttach>().Where(o => o.IsDelete == false);

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.Equals(key, "userId")) objs = objs.Where(o => o.UserId == int.Parse(value));
                }
            }

            return Json(new ActionResultDto { Result = new { Items = objs.ToList() } });
        }

        public string convertToUnSign(string s)
        {
            Regex regex = new Regex("\\p{IsCombiningDiacriticalMarks}+");
            string temp = s.Normalize(NormalizationForm.FormD);
            return regex.Replace(temp, String.Empty).Replace('\u0111', 'd').Replace('\u0110', 'D').Replace(" ", "_");
        }

        private string GetUniqueFileName(string fileName)
        {
            fileName = Path.GetFileName(fileName);
            return Path.GetFileNameWithoutExtension(fileName)
                      + "_"
                      + Guid.NewGuid().ToString().Substring(0, 4)
                      + Path.GetExtension(fileName);
        }
    }
}