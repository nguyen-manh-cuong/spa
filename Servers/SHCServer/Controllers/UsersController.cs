using System;
using System.Collections.Generic;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using SHCServer;
using SHCServer.Models;
using SHCServer.ViewModels;
using Viettel;
using Viettel.MySql;

namespace AuthServer.Controllers
{
    public class UsersController : BaseController
    {
        private readonly string _connectionString;

        public UsersController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("MdmConnection")));
            _excep = new FriendlyException();
            _connectionString = configuration.GetConnectionString("MdmConnection");
        }

        [HttpGet]
        [Route("api/users")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _context.Query<User>();

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.Equals(key, "provinceCode")) objs = objs.Where(o => o.ProvinceCode == value);
                    if (string.Equals(key, "districtCode")) objs = objs.Where(o => o.DistrictCode == value);
                    if (string.Equals(key, "wardCode")) objs = objs.Where(o => o.WardCode == value);
                    if (string.Equals(key, "userName")) objs = objs.Where(o => o.UserName.Contains(value));
                    if (string.Equals(key, "accountType")) objs = objs.Where(o => o.AccountType == int.Parse(value));
                    if (string.Equals(key, "fullName")) objs = objs.Where(o => o.FullName.Contains(value));
                    if (string.Equals(key, "userPhoneEmail")) objs = objs.Where(o => o.PhoneNumber.Contains(value) || o.Email.Contains(value));
                }
            }

            if (sorting != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
                {
                    if (!Utils.PropertyExists<User>(key)) continue;

                    objs = value == "asc" ? objs.OrderBy(u => key) : objs.OrderByDesc(u => key);
                }
            }

            return Json(new ActionResultDto { Result = new { Items = objs.TakePage(skipCount == 0 ? 1 : skipCount + 1, maxResultCount).Select(u => new UserViewModel(u, _connectionString)).ToList(), TotalCount = objs.Count() } });
        }

        [HttpPut]
        [Route("api/users")]
        public IActionResult Update([FromBody] UserInputViewModel obj)
        {
            var user = _context.Query<User>().FirstOrDefault(u => u.Id == obj.Id);

            if (user == null) return StatusCode(401, _excep.Throw("UserNotFound"));

            user.Password = !string.IsNullOrEmpty(obj.Password) ? Utils.HashPassword(obj.Password) : user.Password;

            try
            {
                _context.Session.BeginTransaction();

                _context.Update<User>(g => g.Id == obj.Id, a => new User()
                {
                    Password = user.Password,
                    FullName = obj.FullName,
                    Email = obj.Email,
                    PhoneNumber = obj.PhoneNumber,
                    Sex = obj.Sex,
                    BirthDay = obj.BirthDay,
                    AccountType = obj.AccountType,
                    ProvinceCode = obj.ProvinceCode,
                    DistrictCode = obj.DistrictCode,
                    WardCode = obj.WardCode,
                    Address = obj.Address
                });

                _context.Delete<UserGroup>(ug => ug.UserId == obj.Id);

                if (obj.Groups.Length > 0)
                {
                    // Add group
                    const string subQuery = "INSERT INTO sys_users_groups (UserId, GroupId) VALUES ";
                    var subParamQuery = new List<string>();
                    var subParam = new List<DbParam>();

                    var i = 1;

                    foreach (var group in obj.Groups)
                    {
                        subParamQuery.Add($"(@{"UserId" + i},@{"GroupId" + i})");
                        subParam.Add(DbParam.Create("@UserId" + i, obj.Id));
                        subParam.Add(DbParam.Create("@GroupId" + i, group.Id));
                        i++;
                    }

                    _context.Session.ExecuteNonQuery($"{subQuery} {string.Join(",", subParamQuery)}", subParam);
                }

                _context.Session.CommitTransaction();

                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                if (_context.Session.IsInTransaction) _context.Session.RollbackTransaction();
                return StatusCode(500, _excep.Throw("Có lỗi xảy ra !", e.Message));
            }
        }

    }
}