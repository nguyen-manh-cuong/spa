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
        private string nameData;
        private readonly int _port;

        public AuthController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _context = new MySqlContext(new MySqlConnectionFactory(_connectionString));
            _contextmdmdb = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("MdmConnection")));

            _host = configuration.GetValue("Gateway:Ip", "127.0.0.1");
            _port = configuration.GetValue("Gateway:Port", 9000);
            _excep = new FriendlyException();

            if (_connectionString.IndexOf("smarthealthcare_58") > 0) nameData = "smarthealthcare_58";
            else if (_connectionString.IndexOf("smarthealthcare") > 0) nameData = "smarthealthcare";
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
            string query = @"SELECT 
                                    ui.*,
                                    u.Status as MdmStatus
                                FROM " + nameData + @".sys_users ui
                                INNER JOIN mdm.sys_users u
                                ON ui.UserId = u.UserId
                                AND ui.IsDelete = 0";
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
            List<UserLoginViewModel> lst = new List<UserLoginViewModel>();
            while (reader.Read())
            {
                lst.Add(new UserLoginViewModel()
                {
                    Id = Convert.ToInt32(reader["Id"]),
                    Counter = Convert.ToInt32(reader["Counter"]),
                    LockedTime = reader["LockedTime"] != DBNull.Value ? Convert.ToDateTime(reader["LockedTime"]) : (DateTime.Parse("1970/01/01 00:00:00")),
                    Status = Convert.ToInt32(reader["Status"]),
                    ExpriredDate = reader["ExpriredDate"] != DBNull.Value ? Convert.ToDateTime(reader["ExpriredDate"]) : DateTime.Now,
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
                            LockedTime = DateTime.Now.AddMinutes(5) //AddHours(14)
                            //LockedTime = DateTime.Now.AddMinutes(2) //AddHours(14)
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
                    else if (int.Parse(data["counter"].ToString()) < 10)
                    {
                        _context.Update<User>(c => c.Id == currentUser.Id, x => new User()
                        {
                            Counter = currentUser.Counter + 1
                        });
                    }
                }

                _context.Session.CommitTransaction();
            }
            return Json(new ActionResultDto { Result = new { Items = currentUser } });
        }

        [HttpPost]
        [Route("api/Register")]
        public object Register([FromForm] UserInputViewModel obj)
        {
            obj.UserName = obj.UserName.Trim().ToLower();
            obj.Email = obj.Email.Trim().ToLower();

            var getUser = _contextmdmdb.Query<UserMDM>();

            if (getUser.Where(u => u.UserName == obj.UserName.Trim()).Count() > 0)
            {
                return StatusCode(406, _excep.Throw(406, "Thông báo", "Tài khoản đã tồn tại!"));
            }

            if (getUser.Where(u => u.PhoneNumber == obj.PhoneNumber.Trim() && !string.IsNullOrEmpty(u.PhoneNumber)).Count() > 0)
            {
                return StatusCode(406, _excep.Throw(406, "Thông báo", "Số điện thoại đã tồn tại!"));
            }

            if (getUser.Where(u => u.Email == obj.Email.Trim() && !string.IsNullOrEmpty(u.Email)).Count() > 0)
            {
                return StatusCode(406, _excep.Throw(406, "Thông báo", "Email đã tồn tại!"));
            }

            if (getUser.Where(u => u.Identification == obj.Identification && !string.IsNullOrEmpty(u.Identification)).Count() > 0)
            {

                return StatusCode(406, _excep.Throw(406, "Thông báo", "Số CMND đã tồn tại!"));
            }

            if (getUser.Where(u => u.CertificationCode == obj.CertificationCode && !string.IsNullOrEmpty(u.CertificationCode)).Count() > 0)
            {
                return StatusCode(406, _excep.Throw(406, "Thông báo", "Số GPHN đã tồn tại!"));
            }

            if (getUser.Where(u => u.LisenceCode == obj.LisenceCode && !string.IsNullOrEmpty(u.LisenceCode)).Count() > 0)
            {
                return StatusCode(406, _excep.Throw(406, "Thông báo", "Số GPKD đã tồn tại!"));
            }

            if (getUser.Where(u => u.Insurrance == obj.Insurrance && !string.IsNullOrEmpty(u.Insurrance)).Count() > 0)
            {
                return StatusCode(406, _excep.Throw(406, "Thông báo", "Số thẻ BHYT  đã tồn tại!"));
            }

            try
            {

                //check cấu hình trong sys_configs
                var config = _context.Query<Config>().Where(e => !e.IsDelete && e.IsActive == true); //lấy thông tin cấu hình

                string checkvalue = ""; //giá trị check

                //check theo loại tài khoản
                if (obj.AccountType == 1) //Thành viên
                {
                    var accType = config.Where(e => e.Code == "A03.ApprovePatientAccount").FirstOrDefault();
                    if (accType != null) checkvalue = accType.Values;
                }
                else if (obj.AccountType == 2) // Bác sỹ/ Chuyên gia/ Điều dưỡng
                {
                    var accType = config.Where(e => e.Code == "A04. ApproveDoctorAccount").FirstOrDefault();
                    if (accType != null) checkvalue = accType.Values;
                }
                else if (obj.AccountType == 3) //Cơ sở y tế/ doanh nghiệp
                {
                    var accType = config.Where(e => e.Code == "A05. ApproveHealthFacilityAccount").FirstOrDefault();
                    if (accType != null) checkvalue = accType.Values;
                }

                // Insert sys_users in mdm
                _contextmdmdb.Session.BeginTransaction();
                _contextmdmdb.Insert(() => new UserMDM
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

                    CreateUserId = obj.CreateUserId,
                    CreateDate = DateTime.Now,

                    CertificationCode = obj.CertificationCode,
                    Insurrance = obj.Insurrance,
                    Identification = obj.Identification,
                    LisenceCode = obj.LisenceCode,

                    Status = checkvalue == "0" ? 1 : 0, //nếu giá trị là 0 thì set = 1(hoạt động), còn lại là 0 (không hoạt động)
                });
                _contextmdmdb.Session.CommitTransaction();

                UserMDM user = _contextmdmdb.Query<UserMDM>().Where(u => u.UserName == obj.UserName && u.IsDelete == false).FirstOrDefault();
                int userId = user != null ? user.UserId : 0;

                // Insert sys_users in smarthealthcare
                _context.Session.BeginTransaction();
                _context.Insert(() => new User
                {
                    Status = checkvalue == "0" ? 2 : 1, //nếu giá trị là 0 thì set = 2(đã duyệt), còn lại là 1 (chờ duyệt),
                    UserId = userId,
                    ExpriredDate = DateTime.Now.AddMonths(2)
                });
                _context.Session.CommitTransaction();

                // Insert sys_users_services in smarthealthcare
                if (user != null && obj.AccountType != 1)
                {
                    _context.Insert(() => new UsersServices
                    {
                        UserId = user.UserId,
                        IsUsingCall = obj.isUsingCall != null ? obj.isUsingCall : false,
                        IsUsingDoctor = obj.isUsingDoctor != null ? obj.isUsingDoctor : false,
                        IsUsingExamination = obj.isUsingExamination != null ? obj.isUsingExamination : false,
                        IsUsingRegister = obj.isUsingRegister != null ? obj.isUsingRegister : false,
                        IsUsingUpload = obj.isUsingUpload != null ? obj.isUsingUpload : false,
                        IsUsingVideo = obj.isUsingVideo != null ? obj.isUsingVideo : false,
                    });
                }

                // Insert sys_users_attachs in smarthealthcare
                _context.Session.BeginTransaction();
                var files = Request.Form.Files;
                if (files.Count > 0)
                {
                    foreach (var file in files)
                    {
                        var uniqueFileName = GetUniqueFileName(ConvertToUnSign(file.FileName));
                        var uploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                        var filePath = Path.Combine(uploads, uniqueFileName);
                        if (file.Name == "cmnd")
                        {
                            _context.Insert(() => new UsersAttach
                            {
                                UserId = user.UserId,
                                Path = "/uploads/" + uniqueFileName,
                                Type = "1",
                                CreateUserId = obj.CreateUserId,
                                CreateDate = DateTime.Now
                            });
                        }
                        else
                        {
                            if (obj.AccountType == 2)
                            {
                                _context.Insert(() => new UsersAttach
                                {
                                    UserId = user.UserId,
                                    Path = "/uploads/" + uniqueFileName,
                                    Type = "3",
                                    CreateUserId = obj.CreateUserId,
                                    CreateDate = DateTime.Now
                                });
                            }
                            else if (obj.AccountType == 3)
                            {
                                _context.Insert(() => new UsersAttach
                                {
                                    UserId = user.UserId,
                                    Path = "/uploads/" + uniqueFileName,
                                    Type = "4",
                                    CreateUserId = obj.CreateUserId,
                                    CreateDate = DateTime.Now
                                });
                            }
                            else
                            {
                                _context.Insert(() => new UsersAttach
                                {
                                    UserId = user.UserId,
                                    Path = "/uploads/" + uniqueFileName,
                                    Type = "2",
                                    CreateUserId = obj.CreateUserId,
                                    CreateDate = DateTime.Now
                                });
                            }
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
                if (_contextmdmdb.Session.IsInTransaction) _contextmdmdb.Session.RollbackTransaction();
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
                return Json(new ActionResultDto());
            }

            return StatusCode(406, _excep.Throw(406, "Thông báo", "Email không tồn tại."));
        }

        [HttpPut]
        [Route("api/reset-password-user")]
        public IActionResult ResetPasswordUser([FromBody] ResetPasswordViewModel obj)
        {
            ResetPassword currentUser = _contextmdmdb.Query<ResetPassword>().Where(u => u.UserName == obj.UserName).FirstOrDefault();

            string currenPassword = currentUser.Password;
            // so sanh mat khau nhap vao voi mat khau cua user do trong db
            if (!Utils.VerifyHashedPassword(currenPassword, obj.Password))
            {
                return StatusCode(406, _excep.Throw(406, "Thông báo", "Đổi mật khẩu không thành công. Mật khẩu hiện tại không đúng"));
            }

            if (Utils.VerifyHashedPassword(currenPassword, obj.NewPassword))
            {
                return StatusCode(406, _excep.Throw(406, "Thông báo", "Đổi mật khẩu không thành công. Mật khẩu mới không được trùng với mật khẩu hiện tại"));
            }

            try
            {
                _contextmdmdb.Session.BeginTransaction();
                _contextmdmdb.Update<ResetPassword>(b => b.UserName == obj.UserName, a => new ResetPassword()
                {
                    Password = Utils.HashPassword(obj.NewPassword),
                });

                _contextmdmdb.Session.CommitTransaction();

                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                if (_contextmdmdb.Session.IsInTransaction)
                    _contextmdmdb.Session.RollbackTransaction();
                return StatusCode(500, _excep.Throw("Có lỗi xảy ra !", e.Message));
            }
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

        public string ConvertToUnSign(string s)
        {
            Regex regex = new Regex("\\p{IsCombiningDiacriticalMarks}+");
            string temp = s.Normalize(NormalizationForm.FormD);
            return regex.Replace(temp, String.Empty).Replace('\u0111', 'd').Replace('\u0110', 'D').Replace(" ", "_");
        }
    }
}