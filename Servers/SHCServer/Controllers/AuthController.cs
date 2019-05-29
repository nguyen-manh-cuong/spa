using AuthServer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using SHCServer.Models;
using SHCServer.ViewModels;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using Viettel;
using Viettel.MySql;

namespace SHCServer.Controllers
{
    public class AuthController : BaseController
    {
        private readonly string _connectionString;
        private readonly string _host;
        private readonly int _port;

        public AuthController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("DefaultConnection")));
            _connectionString = configuration.GetConnectionString("DefaultConnection");

            _host = configuration.GetValue("Gateway:Ip", "127.0.0.1");
            _port = configuration.GetValue("Gateway:Port", 9000);
            _excep = new FriendlyException();
        }

        [HttpGet]
        [Route("api/UserConfiguration")]
        public IActionResult GetUserConfiguration()
        {
            string accesToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            string language = Request.Headers["AppCulture"].ToString() ?? "vi";
            bool logged = !string.IsNullOrEmpty(accesToken) && !Utils.IsExpired(accesToken, _settings.Value.Secret);
            var portNum = Request.Host.Port;

            //check null language
            if (string.IsNullOrEmpty(language)) language = "vi";

            List<LanguageDto> languages = new List<LanguageDto>
            {
                new LanguageDto {Name = "vi", DisplayName = "Tiếng Việt", Icon = "famfamfam-flags vn"},
                new LanguageDto {Name = "en", DisplayName = "English", Icon    = "famfamfam-flags us"}
            };

            foreach (LanguageDto l in languages)
            {
                if (l.Name == language)
                {
                    l.IsDefault = true;
                }
            }

            return Json(new ActionResultDto
            {
                Result = new
                {
                    localization = new
                    {
                        currentCulture = languages.Where(l => l.IsDefault).Select(l => new { l.Name, l.DisplayName }).FirstOrDefault(),
                        currentLanguage = languages.FirstOrDefault(l => l.IsDefault),
                        sources = new[] { new { name = "viettel", type = "MultiTenantLocalizationSource" } },
                        values = new
                        {
                            viettel = _context.Query<Language>().ToList().ToDictionary(x => x.Key, x => x.GetType().GetProperty(new CultureInfo("en-US").TextInfo.ToTitleCase(language)).GetValue(x, null))
                        },
                        languages
                    },
                    auth = new
                    {
                        AllPermissions = _context.Query<Router>().Select(o => new RouteViewModel(o, _connectionString)).ToList()
                    },
                    setting = new { key = _settings.Value.Secret },
                    session = new
                    {
                        UserId = logged ? Utils.GetUidToken(accesToken, _settings.Value.Secret) : 0
                    },
                    nav = new
                    {
                        menus = new
                        {
                            MainMenu = new
                            {
                                DisplayName = "Main Menu",
                                Name = "mainMenu",
                                Items = new List<MenuItem>
                                {
                                    new MenuItem {Name = "HomePage", Icon      = "home", Route        = "/app/dashboard"},
                                    //new MenuItem {Name = "UsersManager", Icon = "people", Route = "/app/users"},
                                    new MenuItem {Name = "Language", Icon = "g_translate", Route = "/app/languages"},
                                    new MenuItem {Name = "SMS", Icon = "sms", Items = new List<MenuItem>{
                                         new MenuItem {Name = "PackagesMenu", Icon = "", Route = "/app/sms-package"},
                                         new MenuItem {Name = "PackagesDistributeSmsPackage", Icon = "", Route = "/app/sms-package-distribute"},
                                         new MenuItem {Name = "TemplatesSms", Icon = "", Route = "/app/sms-template"}
                                    }},
                                    new MenuItem {Name = "SmsManualMenu", Icon = "sms", Items = new List<MenuItem>{
                                         new MenuItem {Name = "SmsManualReExamination", Icon = "", Route = "/app/sms-manual-re-examination"},
                                         new MenuItem {Name = "SmsManualBirthday", Icon = "", Route = "/app/sms-manual-birthday"},
                                         new MenuItem {Name = "SmsUserManual", Icon = "", Route = "/app/sms-manual"},
                                         new MenuItem {Name = "SmsLog", Icon = "", Route = "/app/sms-log"}
                                    }},
                                    new MenuItem {Name = "Admin", Icon = "settings", Items = new List<MenuItem>{
                                         new MenuItem {Name = "Danh mục khung giờ khám", Icon = "", Route = "/app/booking-timeslots"},
                                         new MenuItem {Name = "CategoryCommon", Icon="", Route="/app/category-common"},
                                         new MenuItem {Name = "ApproveExamScheduleDoctor", Icon="", Route="/app/booking-doctor-approve"},
                                         new MenuItem {Name = "ExamScheduleDoctor", Icon="", Route="/app/booking-doctor"},
                                         new MenuItem {Name = "Thống kê DS bệnh nhân đặt khám", Icon="", Route="/app/booking-informations"},
                                         new MenuItem {Name = "Danh sách bệnh nhân đặt khám", Icon="", Route="/app/booking-list"},
                                         new MenuItem {Name = "Danh sách bác sĩ", Icon="", Route="/app/doctor"},
                                    }}
                                }
                            }
                        }
                    }
                }
            });
        }

        [HttpGet]
        [Route("api/GetCurrentLoginInformations")]
        public IActionResult GetCurrentLoginInformations()
        {
            Microsoft.Extensions.Primitives.StringValues accesToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (!string.IsNullOrEmpty(accesToken))
            {
                if (!Utils.IsExpired(accesToken, _settings.Value.Secret))
                {
                    int uidToken = Utils.GetUidToken(accesToken, _settings.Value.Secret);

                    return Json(new ActionResultDto
                    {
                        Result = new
                        {
                            user = _context.Query<User>().Where(u => u.Id == uidToken).Select(u => new UserViewModel(u, _connectionString)).FirstOrDefault()
                        }
                    });
                }
            }
            return Json(new ActionResultDto { Result = new { user = "" } });
        }

        [HttpGet]
        [Route("api/Auth")]
        public IActionResult Login(int skipCount = 0, int maxResultCount = 10, string sorting = null, string filter = null)
        {
            string query = @"select 
                                    ui.*,
                                    u.Status as MdmStatus
                                from smarthealthcare.sys_users ui
                                inner join mdm.sys_users u on ui.Id = u.UserId";
            List<string> clause = new List<string>();
            List<DbParam> param = new List<DbParam>();

            if (filter != null && filter != "null")
            {
                var data = JsonConvert.DeserializeObject<Dictionary<string, string>>(filter);
                if (data.ContainsKey("userName"))
                {
                    clause.Add("WHERE u.UserName = @userName OR u.Email = @userName OR u.PhoneNumber = @userName");
                    param.Add(DbParam.Create("@userName", data["userName"].ToString()));
                }
            }

            string strQuery = $"{query} {string.Join(" ", clause)}";
            var reader = _context.Session.ExecuteReader(strQuery, param);
            List<User> lst = new List<User>();
            while (reader.Read())
            {
                lst.Add(new User()
                {
                    Id = Convert.ToInt32(reader["Id"]),
                    Counter = Convert.ToInt32(reader["Counter"]),
                    LockedTime = reader["LockedTime"] != DBNull.Value ? Convert.ToDateTime(reader["LockedTime"]) : (DateTime.Parse("1970/12/12 00:01")),
                    Status = Convert.ToInt32(reader["Status"]),
                    ExpriredDate = reader["LockedTime"] != DBNull.Value ? Convert.ToDateTime(reader["LockedTime"]) : DateTime.Now,
                    MdmStatus = Convert.ToInt32(reader["MdmStatus"])
                });
            }
            reader.Close();
            if (lst.Count == 0)
            {
                return Json(new ActionResultDto { Result = new { Items = "" } });
            }
            var currentUser = lst.FirstOrDefault();

            if (filter != null && filter != "null")
            {
                var data = JsonConvert.DeserializeObject<Dictionary<string, string>>(filter);
                _context.Session.BeginTransaction();
                if (data.ContainsKey("counter"))
                {
                    

                    if (int.Parse(data["counter"].ToString()) >= 10)
                    {
                        _context.Update<User>(c => c.Id == currentUser.Id, x => new User()
                        {
                            Counter = currentUser.Counter + 1,
                            LockedTime = DateTime.Now.AddMinutes(60)
                        });
                    }
                    else if (int.Parse(data["counter"].ToString()) == -1)
                    {
                        _context.Update<User>(c => c.Id == currentUser.Id, x => new User()
                        {
                            Counter = 0,
                            LockedTime = null
                        });
                    }
                    else
                    {
                        _context.Update<User>(c => c.Id == currentUser.Id, x => new User()
                        {
                            Counter = currentUser.Counter + 1
                        });
                    }

                }

                if (data.ContainsKey("lockedTime") && double.Parse(data["lockedTime"].ToString()) > 60)
                {
                    _context.Update<User>(c => c.Id == currentUser.Id, x => new User()
                    {
                        LockedTime = null
                    });
                }
                _context.Session.CommitTransaction();
            }


            return Json(new ActionResultDto { Result = new { Items = currentUser } });
        }

        [HttpPost]
        [Route("api/Register")]
        public object Register([FromForm] UserInputViewModel obj)
        {
            var User = _context.Query<User>();

            if (User.Where(u => u.UserName == obj.UserName).Count() > 0)
            {
                return StatusCode(406, _excep.Throw("Đăng ký không thành công.", "Tài khoản đã tồn tại!"));
            }
            if (User.Where(u => u.Email == obj.Email).Count() > 0)
            {
                return StatusCode(406, _excep.Throw("Đăng ký không thành công.", "Email đã tồn tại!"));
            }
            if (User.Where(u => u.PhoneNumber == obj.PhoneNumber).Count() > 0)
            {
                return StatusCode(406, _excep.Throw("Đăng ký không thành công.", "Số điện thoại đã tồn tại!"));
            }
            if (obj.Identification != "null" && !string.IsNullOrEmpty(obj.Identification) && User.Where(u => u.Identification == obj.Identification).Count() > 0)
            {
                return StatusCode(406, _excep.Throw("Đăng ký không thành công.", "Số CMND đã tồn tại!"));
            }

            try
            {
                _context.Session.BeginTransaction();
                _context.Insert(() => new User
                {
                    UserName = obj.UserName,
                    Password = Utils.HashPassword(obj.Password),
                    AccountType = obj.AccountType,

                    FullName = obj.FullName,
                    Sex = obj.Sex,
                    BirthDay = obj.BirthDay,

                    Email = obj.Email,
                    PhoneNumber = obj.PhoneNumber,
                    Address = obj.Address,

                    ProvinceCode = obj.ProvinceCode,
                    DistrictCode = obj.DistrictCode,
                    WardCode = obj.WardCode,

                    Register = obj.Register,
                    Identification = obj.Identification,
                    Insurrance = obj.Insurrance,
                    WorkPlace = obj.WorkPlace,
                    HealthFacilitiesName = obj.HealthFacilitiesName,
                    Specialist = obj.Specialist
                });

                User user = _context.Query<User>().Where(u => u.UserName == obj.UserName).FirstOrDefault();

                if (user != null && obj.AccountType != 1)
                {
                    _context.Insert(() => new UsersServices
                    {
                        UserId = user.Id,
                        IsUsingCall = obj.isUsingCall != null ? obj.isUsingCall : false,
                        IsUsingdoctor = obj.isUsingdoctor != null ? obj.isUsingdoctor : false,
                        IsUsingExamination = obj.isUsingExamination != null ? obj.isUsingExamination : false,
                        IsUsingRegister = obj.isUsingRegister != null ? obj.isUsingRegister : false,
                        IsUsingUpload = obj.isUsingUpload != null ? obj.isUsingUpload : false,
                        IsUsingVideo = obj.isUsingVideo != null ? obj.isUsingVideo : false,
                    });
                }

                var _files = Request.Form.Files;
                if (_files.Count > 0)
                {
                    foreach (var file in _files)
                    {
                        var uniqueFileName = GetUniqueFileName(convertToUnSign(file.FileName));
                        var uploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                        var filePath = Path.Combine(uploads, uniqueFileName);
                        if (file.Name == "cmnd")
                        {
                            _context.Insert(() => new UsersAttach
                            {
                                UserId = user.Id,
                                Path = "/uploads/" + uniqueFileName,
                                Type = "1"
                            });
                        }
                        else
                        {
                            _context.Insert(() => new UsersAttach
                            {
                                UserId = user.Id,
                                Path = "/uploads/" + uniqueFileName,
                                Type = "2"
                            });
                        }
                        file.CopyTo(new FileStream(filePath, FileMode.Create));
                    }
                }

                _context.Session.CommitTransaction();
                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                if (_context.Session.IsInTransaction) _context.Session.RollbackTransaction();
                return StatusCode(500, _excep.Throw("Đăng ký không thành công.", e.Message.ToString()));
            }
        }

        [Route("api/get-captcha-image")]
        public IActionResult GetCaptchaImage()
        {
            int width = 100;
            int height = 36;
            string captchaCode = Captcha.GenerateCaptchaCode();
            CaptchaResult result = Captcha.GenerateCaptchaImage(width, height, captchaCode);

            return Json(new { Code = result.CaptchaCode, Data = result.CaptchBase64Data });
        }

        [HttpPost]
        [Route("api/send-mail")]
        public IActionResult SendMailResetPassword([FromBody] string email)
        {
            User currentUser = _context.Query<User>().Where(u => u.Email == email).FirstOrDefault();

            if (currentUser != null)
            {
                //SHCServer.SendMail.SendMailResetPassword("trungngoc@dichthuatvantin.com", email, "NgocLong90", "smtp.googlemail.com", 587);
                return Json(new ActionResultDto());
            }

            return StatusCode(406, _excep.Throw(406, "Thông báo", "Email không tồn tại."));
        }

        [HttpPut]
        [Route("api/reset-password-user")]
        public IActionResult ResetPasswordUser([FromBody] UserResetPasswordViewModel obj)
        {
            User currentUser = _context.Query<User>().Where(u => u.UserName == obj.UserName).FirstOrDefault();

            string currenPassword = currentUser.Password;
            string logPassword = currentUser.PasswordLog;
            if (!Utils.VerifyHashedPassword(currenPassword, obj.OldPassword))
            {
                return StatusCode(406, _excep.Throw(406, "Thông báo", "Đổi mật khẩu không thành công. Mật khẩu hiện tại không đúng"));
            }

            if (Utils.VerifyHashedPassword(currenPassword, obj.NewPassword))
            {
                return StatusCode(406, _excep.Throw(406, "Thông báo", "Đổi mật khẩu không thành công. Mật khẩu mới không được trùng với mật khẩu hiện tại"));
            }

            try
            {
                _context.Session.BeginTransaction();
                _context.Update<User>(b => b.UserName == obj.UserName, a => new User()
                {
                    PasswordLog = currenPassword,
                    Password = Utils.HashPassword(obj.NewPassword),
                    UpdateDate = DateTime.Now
                });

                _context.Session.CommitTransaction();

                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                if (_context.Session.IsInTransaction)
                    _context.Session.RollbackTransaction();
                return StatusCode(500, _excep.Throw("Có lỗi xảy ra !", e.Message));
            }
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

        private static AuthenticateResultModel GenerateJwtToken(string email, User user, IOptions<Audience> settings)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.UserName), new Claim("Uid", user.Id.ToString())
            };

            JwtSecurityToken token = new JwtSecurityToken(
                    issuer: settings.Value.Iss,
                    audience: settings.Value.Aud,
                    claims: claims,
                    notBefore: DateTime.UtcNow,
                    expires: DateTime.Now.AddDays(Convert.ToDouble(settings.Value.Expire)),
                    signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Value.Secret)), SecurityAlgorithms.HmacSha256)
            );

            return new AuthenticateResultModel
            {
                AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
                EncryptedAccessToken = "", // GetEncrpyedAccessToken(accessToken),
                ExpireInSeconds = Convert.ToDouble(settings.Value.Expire) * 60 * 24,
                UserId = user.Id
            };
        }
    }
}