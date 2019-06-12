using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using SHCServer.Models;
using SHCServer.ViewModels;
using Viettel.MySql;

namespace SHCServer.Controllers
{
    [Route("api/sms-campaign")]
  
    public class SmsCampaignController : BaseController
    {
        private readonly string _connectionString;
        public SmsCampaignController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _excep = new FriendlyException();
        }

        [HttpGet]
        public IActionResult GetAll(int skipCount = 0,int maxResultCount = 10,string sorting =null,string filter = null)
        {
            var objs = _context.Query<SmsCampaign>().Where(o => o.IsDelete == false);

            if (filter != null)
            {
                foreach(var (key,value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.IsNullOrEmpty(value))
                        continue;

                    if (string.Equals(key, "campaignName"))
                    {
                        var s = value.Replace(@"%", "\\%").Replace(@"_", "\\_").Trim();
                        objs = objs.Where(o => o.CampaignName.Contains(s));
                    }

                    if (string.Equals(key, "campaignStatus"))
                    {
                        objs = objs.Where(o => o.Status ==int.Parse(value));
                    }
                }
            }

            if (sorting != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
                {
                    if (string.Equals(key, "CampaignName"))
                    {
                        objs = objs.OrderByDesc(o => o.CampaignName);
                    }
                    if (string.Equals(key, "SendTime"))
                    {
                        objs = objs.OrderByDesc(o => o.SendDate).ThenByDesc(o => o.SendHour).ThenByDesc(o=>o.SendMinute);
                    }
                }
            }


            return Json(new ActionResultDto() { Result = new { Items = objs.Select(o=>new SmsCampaignViewModel(o,_connectionString)).TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).ToList() } });
        }

        [HttpPost]
        public IActionResult Create(SmsCampaignViewModel obj)
        {
            return Json(new ActionResultDto());
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id,SmsCampaign obj)
        {
            return Json(new ActionResultDto());
        }

        [HttpDelete]
        public IActionResult Delete(int id)
        {
            return Json(new ActionResultDto());
        }
    }
}