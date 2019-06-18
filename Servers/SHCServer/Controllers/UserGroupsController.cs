using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using SHCServer;
using SHCServer.Models;
using SHCServer.ViewModels;
using Viettel;
using Viettel.MySql;

namespace AdminServer.Controllers
{
    public class UserGroupsController : BaseController
    {
        private readonly string _connectionString;
        private readonly string _connectionStringSHC;
        public UserGroupsController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _contextmdmdb = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("MdmConnection")));
            _connectionString = configuration.GetConnectionString("MdmConnection");
            _excep = new FriendlyException();

            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _connectionStringSHC = configuration.GetConnectionString("DefaultConnection");
        }


        [HttpGet]
        [Route("api/groups")]
        public IActionResult GetAll(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            var objs = _contextmdmdb.Query<Group>()
                              .Where(a => a.IsDelete == false)
                              .LeftJoin<Application>((g, a) => a.ApplicationId == g.ApplicationId)
                              .Select((g, a) => new { g.GroupId, g.ApplicationId, g.GroupName, g.Description, a.ApplicationName });

            if (filter != null)
            {
                var data = JsonConvert.DeserializeObject<Dictionary<string, string>>(filter);

                if (data.ContainsKey("GROUPNAME"))
                {
                    objs = objs.Where(o => o.GroupName.Contains(data["GROUPNAME"].ToString().Replace(@"%", "\\%").Replace(@"_", "\\_").Trim()));
                }

                if (data.ContainsKey("APPLICATIONID"))
                {
                    objs = objs.Where(o => o.ApplicationId == int.Parse(data["APPLICATIONID"].ToString()));
                }

                if (data.ContainsKey("DESCRIPTION"))
                {
                    objs = objs.Where(o => o.GroupName.Contains(data["DESCRIPTION"].ToString().Replace(@"%", "\\%").Replace(@"_", "\\_").Trim()));
                }
            }

            //if (sorting != null)
            //{
            //    foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(sorting))
            //    {
            //        if (!Utils.Utils.PropertyExists<Group>(key))
            //        {
            //            continue;
            //        }

            //        //objs = value == "asc" ? objs.OrderBy(u => key) : objs.OrderByDesc(u => key);
            //        if (key == "groupName")
            //            objs = value == "asc" ? objs.OrderBy(u => u.GroupName) : objs.OrderByDesc(u => u.GroupName);
            //        else if (key == "applicationName")
            //            objs = value == "asc" ? objs.OrderBy(u => u.ApplicationName) : objs.OrderByDesc(u => u.ApplicationName);
            //    }
            //}

            return Json(new ActionResultDto
            {
                Result = new
                {
                    Items =
                objs
                .Skip(skipCount * maxResultCount)
                .Take(maxResultCount)
                .OrderBy(o => o.ApplicationName)
                .ThenBy(o => o.GroupName)
                .ToList(),
                    TotalCount = objs.Count()
                }
            });
        }

        [HttpPut("{id}")]

        public IActionResult Put(int id, [FromBody] GroupInputViewModel obj)
        {
            //try
            //{
            //    var group = context.Query<Group>().Where(o => o.GroupId == id).FirstOrDefault();

            //    if (context.Query<Group>().Where(o => o.GroupName == obj.GroupName && o.ApplicationId == obj.ApplicationId && o.GroupId != id).Any())
            //    {
            //        return StatusCode(406, excep.Throw(406, "Tạo nhóm thất bại", "Tên nhóm đã có !"));
            //    }

            //    context.Session.BeginTransaction();

            //    if (group.ApplicationId != obj.ApplicationId)
            //    {
            //        context.Delete<GroupPermission>(g => g.GroupId == id && g.ApplicationId == group.ApplicationId);

            //        var listMenu = context.Query<Route>().Where(o => o.ApplicationId == obj.ApplicationId && !o.IsDelete).Select(o => new { o.RouteId }).ToList();

            //        if (listMenu.Count > 0)
            //        {
            //            // Add GroupPermission
            //            const string lvlOneQuery      = "INSERT INTO `mdm`.`sys_groups_permissions` (`GroupId`, `ApplicationId`, `RouteId`) VALUES ";
            //            var          lvlOneParamQuery = new List<string>();
            //            var          lvlOneParam      = new List<DbParam>();
            //            var          i                = 1;

            //            foreach (var b in listMenu)
            //            {
            //                lvlOneParamQuery.Add($"(@{"GroupId" + i},@{"ApplicationId" + i},@{"RouteId" + i})");
            //                lvlOneParam.Add(DbParam.Create("@GroupId" + i, id));
            //                lvlOneParam.Add(DbParam.Create("@ApplicationId" + i, obj.ApplicationId));
            //                lvlOneParam.Add(DbParam.Create("@RouteId" + i, b.RouteId));
            //                i++;
            //            }

            //            context.Session.ExecuteNonQuery($"{lvlOneQuery} {string.Join(",", lvlOneParamQuery)}", lvlOneParam);
            //        }
            //    }

            //    context.Update<Group>(g => g.GroupId == id, a => new Group { GroupName = obj.GroupName, ApplicationId = obj.ApplicationId, Description = obj.Description, UpdateDate = DateTime.Now });

            //    context.Session.CommitTransaction();

            //    return Json(new ActionResultDto());
            //}
            //catch (Exception e)
            //{
            //    if (context.Session.IsInTransaction)
            //    {
            //        context.Session.RollbackTransaction();
            //    }

            //    return StatusCode(500, excep.Throw(e.Message));
            //}
            return Json(new ActionResultDto());
        }

        [HttpPost]
        public IActionResult Post([FromBody] GroupInputViewModel obj)
        {
            //if (context.Query<Group>().Where(o => o.GroupName == obj.GroupName && o.ApplicationId == obj.ApplicationId).Any())
            //{
            //    return StatusCode(406, excep.Throw(406, "Tạo nhóm không thành công", "Tên nhóm đã tồn tại !"));
            //}

            //obj.CreateDate = DateTime.Now;

            //try
            //{
            //    context.Session.BeginTransaction();

            //    var id = (int)context.Insert(() => new Group
            //    {
            //            ApplicationId = obj.ApplicationId,
            //            GroupName     = obj.GroupName,
            //            Description   = obj.Description,
            //            CreateDate    = DateTime.Now,
            //            CreateUserId  = obj.CreateUserId
            //    });

            //    var listMenu = context.Query<Route>().Where(o => o.ApplicationId == obj.ApplicationId && !o.IsDelete).Select(o => new { o.RouteId }).ToList();

            //    if (listMenu.Count > 0)
            //    {
            //        // Add GroupPermission
            //        const string lvlOneQuery      = "INSERT INTO `mdm`.`sys_groups_permissions` (`GroupId`, `ApplicationId`, `RouteId`) VALUES ";
            //        var          lvlOneParamQuery = new List<string>();
            //        var          lvlOneParam      = new List<DbParam>();
            //        var          i                = 1;

            //        foreach (var b in listMenu)
            //        {
            //            lvlOneParamQuery.Add($"(@{"GroupId" + i},@{"ApplicationId" + i},@{"RouteId" + i})");
            //            lvlOneParam.Add(DbParam.Create("@GroupId" + i, id));
            //            lvlOneParam.Add(DbParam.Create("@ApplicationId" + i, obj.ApplicationId));
            //            lvlOneParam.Add(DbParam.Create("@RouteId" + i, b.RouteId));
            //            i++;
            //        }

            //        context.Session.ExecuteNonQuery($"{lvlOneQuery} {string.Join(",", lvlOneParamQuery)}", lvlOneParam);
            //    }


            //    context.Session.CommitTransaction();

            //    return Json(new ActionResultDto { Result = id });

            //}
            //catch (Exception e)
            //{
            //    if (context.Session.IsInTransaction)
            //    {
            //        context.Session.RollbackTransaction();
            //    }

            //    return StatusCode(500, excep.Throw(500, "Đã có lỗi xảy ra !", e.Message));
            //}
            return Json(new ActionResultDto());
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            //try
            //{
            //    if (context.Query<UsersGroups>().Where(o => o.GroupId == id).Count() > 0) return StatusCode(406, excep.Throw(406, "Xóa nhóm tài khoản không thành công !", "Nhóm tài khoản đã có người dùng"));

            //    context.Session.BeginTransaction();

            //    context.Delete<GroupPermission>(g => g.GroupId == id);

            //    context.Delete<UserGroup>(g => g.GroupId == id);

            //    context.Delete<Group>(g => g.GroupId == id);

            //    context.Session.CommitTransaction();

            //    return Json(new ActionResultDto());
            //}
            //catch (Exception e)
            //{
            //    if (context.Session.IsInTransaction)
            //    {
            //        context.Session.RollbackTransaction();
            //    }

            //    return StatusCode(500, excep.Throw(500, "Đã có lỗi xảy ra !", e.Message));
            //}
            return Json(new ActionResultDto());
        }

        [HttpGet]
        [Route("api/groups-name")]
        public IActionResult GetGroupName(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            string query = @"select g.GroupName, u.UserId
                                from mdm.sys_groups g
                                inner join mdm.sys_users_groups u ON u.GroupId = g.GroupId";
            List<string> clause = new List<string>();
            List<DbParam> param = new List<DbParam>();
            List<UserGroupViewModel> lst = new List<UserGroupViewModel>();;

            if (filter != null)
            {
                foreach (var (key, value) in JsonConvert.DeserializeObject<Dictionary<string, string>>(filter))
                {
                    if (string.Equals(key, "userId"))
                    {
                        clause.Add("AND u.UserId = @userId");
                        param.Add(DbParam.Create("@userId", int.Parse(value)));
                    }
                }
            }

            clause.Add("where u.IsDelete = 0");

            var str = $"{query} {string.Join(" ", clause)}";
            var reader = _context.Session.ExecuteReader($"{query} {string.Join(" ", clause)}", param);

            while (reader.Read())
            {
                lst.Add(new UserGroupViewModel()
                {
                    GroupName = reader["GroupName"].ToString(),
                    UserId = Convert.ToInt32(reader["UserId"]),
                   
                });
            }

            string groupName = "";
            foreach (var item in lst)
            {
                groupName += item.GroupName + ",";
            }

            


            return Json(new ActionResultDto { Result = new { Items = groupName } });

            //var objs = _contextmdmdb.Query<Group>().Where(a => a.IsDelete == false)
            //    .InnerJoin<UserGroup>((g, a) => a.GroupId == g.GroupId);

            //if (filter != null)
            //{
            //    var data = JsonConvert.DeserializeObject<Dictionary<string, string>>(filter);

            //    if (data.ContainsKey("userId"))
            //    {
            //        objs = objs.Where((g, a) => a.UserId == int.Parse(data["userId"].ToString()));
            //    }

              
            //}

            //return Json(new ActionResultDto {Result = new { Items = objs} });
        }
    }
}