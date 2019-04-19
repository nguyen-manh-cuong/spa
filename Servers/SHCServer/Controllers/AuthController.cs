
using SHCServer.Models;
using SHCServer.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Viettel.MySql;
using AuthServer;

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
                                    new MenuItem {Name = "SmsManual", Icon = "sms", Items = new List<MenuItem>{
                                         new MenuItem {Name = "SmsManualReExamination", Icon = "", Route = "/app/sms-manual-re-examination"},
                                         new MenuItem {Name = "SmsManualBirthday", Icon = "", Route = "/app/sms-manual-birthday"},
                                         new MenuItem {Name = "SmsManual", Icon = "", Route = "/app/sms-manual"},
                                         new MenuItem {Name = "SmsLog", Icon = "", Route = "/app/sms-log"}
                                    }},
                                    new MenuItem {Name = "Danh mục khung giờ khám", Icon = "av_timer", Route = "/app/booking-timeslots"},
                                    new MenuItem {Name = "Thống kê danh sách bệnh nhân đặt khám", Icon = "av_timer", Route = "/app/booking-informations"},
                                    new MenuItem{Name = "CategoryCommon", Icon="account_circle", Route="/app/category-common"},
                                    new MenuItem{Name = "Lịch khám bác sĩ", Icon="assignment_turned_in", Route="/app/booking-doctor-approve"}
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

        [HttpPost]
        [Route("api/Auth")]
        public IActionResult Login([FromBody] AuthenticateModel user)
        {
            User currentUser = _context.Query<User>().Where(u => u.UserName == user.UserNameOrEmailAddress || u.Email == user.UserNameOrEmailAddress).FirstOrDefault();

            if (currentUser != null)
            {
                if (Utils.VerifyHashedPassword(currentUser.Password, user.Password))
                {
                    return Json(GenerateJwtToken(user.UserNameOrEmailAddress, currentUser, _settings));
                }
            }

            //return Json(new ActionResultDto { Error = new { code = 0, message = "Login failed!", details = "Invalid user name or password" } });
            return StatusCode(422, _excep.Throw("Đăng nhập không thành công! Tài khoản hoặc mật khẩu không đúng."));
        }

        [HttpPost]
        [Route("api/Register")]
        public object Register([FromBody] UserInputViewModel obj)
        {
            var User = _context.Query<User>();

            if (User.Where(u => u.UserName == obj.UserName).Count() > 0)
            {
                return StatusCode(409, _excep.Throw("Đăng ký thất bại.", "Tài khoản đã tồn tại!"));
            }
            if (User.Where(u => u.Email == obj.Email).Count() > 0)
            {
                return StatusCode(409, _excep.Throw("Đăng ký thất bại.", "Email đã tồn tại!"));
            }
            if (User.Where(u => u.PhoneNumber == obj.PhoneNumber).Count() > 0)
            {
                return StatusCode(409, _excep.Throw("Đăng ký thất bại.", "Số điện thoại đã tồn tại!"));
            }
            if (obj.Identification != null && User.Where(u => u.Identification == obj.Identification).Count() > 0)
            {
                return StatusCode(409, _excep.Throw("Đăng ký thất bại.", "Số CMND đã tồn tại!"));
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

                _context.Session.CommitTransaction();
                return Json(new ActionResultDto());
            }
            catch (Exception e)
            {
                if (_context.Session.IsInTransaction) _context.Session.RollbackTransaction();
                return Json(new ActionResultDto { Error = e.Message });
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