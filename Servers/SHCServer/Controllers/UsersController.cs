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

        public UsersController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("MdmConnection")));
            _connectionString = configuration.GetConnectionString("MdmConnection");
            _excep = new FriendlyException();
        }

        [HttpPost]
        [Route("api/users")]
        public IActionResult Create([FromBody]ResetPasswordViewModel obj)
        { 
            var user = _context.Query<ResetPassword>().Where(u => u.UserName == obj.UserName || u.Email == obj.Email || u.PhoneNumber == obj.PhoneNumber && u.IsDelete == false).FirstOrDefault();

            if (user == null)
            {
                return StatusCode(404, _excep.Throw("Khôi phục mật khẩu không thành công", "Tên đăng nhập, Email hoặc số điện thoại không tồn tại"));
            }

            try
            {
                _context.Session.BeginTransaction();

                _context.Update<UserSecret>(us => us.UserId == user.UserId, x => new UserSecret()
                {
                    IsActive=false
                });

                _context.Insert<UserSecret>(new UserSecret()
                {
                    UserId = user.UserId,
                    SecretCode = obj.SecretCode,
                    IsActive=true,
                    IsDelete=false,
                    CreateDate=DateTime.Now
                });

                _context.Session.CommitTransaction();
                if (string.IsNullOrEmpty(user.Email))
                {
                    return StatusCode(406, _excep.Throw("Khôi phục mật khẩu không thành công","Tài khoản này chưa có email liên kết"));
                }

                if(!SendMail(user.Email, obj.SecretCode,user.UserName))
                {
                    return StatusCode(500, _excep.Throw("Có lỗi xảy ra khi gửi mã bí mật"));
                }
            }
            catch(Exception e)
            {
                if (_context.Session.IsInTransaction)
                {
                    _context.Session.RollbackTransaction();
                }
                return StatusCode(500, _excep.Throw("Có lỗi xảy ra", e.Message));
            }
            return Json(new ActionResultDto());
        }

        [HttpPut]
        [Route("api/users")]
        public IActionResult Update([FromBody] ResetPasswordViewModel obj)
        {
            var user = _context.Query<ResetPassword>().Where(u => u.UserName == obj.UserName || u.Email == obj.Email || u.PhoneNumber == obj.PhoneNumber && u.IsDelete==false).FirstOrDefault();
            var secret = _context.Query<UserSecret>().Where(us => us.SecretCode == obj.SecretCode && us.UserId == user.UserId && us.IsDelete == false).FirstOrDefault();

            if (user == null)
            {
                return StatusCode(404, _excep.Throw("Đổi mật khẩu không thành công", "Tên đăng nhập, Email hoặc số điện thoại không đúng"));
            }
            else if (obj.SecretCode != null)
            {
                if (secret == null)
                {
                    return StatusCode(406, _excep.Throw("Đổi mật khẩu không thành công", "Mã bí mật không đúng"));
                }
                if (secret.IsActive == false)
                {
                    return StatusCode(406, _excep.Throw("Đổi mật khẩu không thành công", "Mã bí mật không còn hiệu lực"));
                }
            }

            if (Utils.VerifyHashedPassword(user.Password, obj.Password))
            {
                return StatusCode(406, _excep.Throw("Đổi mật khẩu không thành công", "Mật khẩu mới không được trùng mật khẩu hiện tại"));
            }

            try
            {
                _context.Session.BeginTransaction();

                _context.Update<UserSecret>(us => us.Id == secret.Id, x => new UserSecret()
                {
                    IsDelete = true,
                    IsActive = false
                });

                _context.Update<ResetPassword>(u => u.UserId == user.UserId, x => new ResetPassword()
                {
                    Password = Utils.HashPassword(obj.Password)
                });

                _context.Session.CommitTransaction();
            }
            catch (Exception e)
            {
                if (_context.Session.IsInTransaction)
                {
                    _context.Session.RollbackTransaction();
                }
                return StatusCode(500, _excep.Throw("Có lỗi xảy ra", e.Message));
            }
            return Json(new ActionResultDto());
        }

        public bool SendMail(string sendTo, string secretCode,string user)
        {
            string userName = "configshc@gmail.com";
            string password = "Abc@123456";
            try
            {
                SmtpClient mailclient = new SmtpClient("smtp.gmail.com", 587);
                mailclient.EnableSsl = true;
                mailclient.Credentials = new NetworkCredential(userName, password);

                MailMessage message = new MailMessage(userName, sendTo);

                message.Subject = "[SHC] Thay đổi mật khẩu";
                                                                                                 
                message.Body = "Xin chào " + user + "\nChúng tôi vừa nhận được yêu cầu thay đổi mật khẩu từ phía bạn"+ "\nVui lòng sử dụng mã bí mật để thay đổi mật khẩu: " + secretCode + "\nĐể bảo mật, bạn vui lòng thay đổi mật khẩu sau khi đăng nhập và không tiết lộ cho bất kỳ cá nhân nào.";

                mailclient.Send(message);

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}