using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using SHCServer.Models;
using SHCServer.ViewModels;
using System;
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
            if (Utils.VerifyHashedPassword(user.Password, obj.Password))
            {
                return StatusCode(406, _excep.Throw("Khôi phục mật khẩu không thành công", "Mật khẩu mới không được trùng mật khẩu hiện tại"));
            }
            if (user == null)
            {
                return StatusCode(404, _excep.Throw("Khôi phục mật khẩu không thành công", "Tên đăng nhập, Email hoặc số điện thoại không tồn tại"));
            }
            else if (obj.SecretCode != null)
            {
                if (secret == null)
                {
                    return StatusCode(406, _excep.Throw("Khôi phục mật khẩu không thành công", "Mã xác nhận không đúng"));
                }
                if (secret.IsActive == false)
                {
                    return StatusCode(406, _excep.Throw("Khôi phục mật khẩu không thành công", "Mã xác nhận không còn hiệu lực"));
                }
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
    }
}