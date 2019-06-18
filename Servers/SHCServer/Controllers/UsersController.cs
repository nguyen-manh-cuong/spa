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
        string _newPassword;
        public UsersController(IOptions<Audience> settings, IConfiguration configuration)
        {
            _settings = settings;
            _context = new MySqlContext(new MySqlConnectionFactory(configuration.GetConnectionString("MdmConnection")));
            _connectionString = configuration.GetConnectionString("MdmConnection");
            _excep = new FriendlyException();
        }

        [HttpPut]
        [Route("api/users")]
        public IActionResult Update([FromBody]ResetPasswordViewModel obj)
        {
            var user = _context.Query<ResetPassword>().Where(u => u.UserName == obj.UserName || u.Email == obj.Email || u.PhoneNumber == obj.PhoneNumber && u.IsDelete == false).FirstOrDefault();

            if (user == null)
            {
                return StatusCode(404, _excep.Throw("Khôi phục mật khẩu không thành công", "Tên đăng nhập, Email hoặc số điện thoại không tồn tại"));
            }

            try
            {

                //_context.Update<UserSecret>(us => us.UserId == user.UserId, x => new UserSecret()
                //{
                //    IsActive=false
                //});

                //_context.Insert<UserSecret>(new UserSecret()
                //{
                //    UserId = user.UserId,
                //    SecretCode = obj.SecretCode,
                //    IsActive=true,
                //    IsDelete=false,
                //    CreateDate=DateTime.Now
                //});



                if (string.IsNullOrEmpty(user.Email))
                {
                    return StatusCode(406, _excep.Throw("Khôi phục mật khẩu không thành công","Tài khoản này chưa có email liên kết"));
                }
                else if (string.IsNullOrEmpty(user.Email) && string.IsNullOrEmpty(user.PhoneNumber))
                {
                    return StatusCode(406, _excep.Throw("Khôi phục mật khẩu không thành công", "Tài khoản này chưa có email, số điện thoại liên kết"));
                }

                _context.Session.BeginTransaction();

                _context.Update<ResetPassword>(u => u.UserId == user.UserId, x => new ResetPassword()
                {
                    Password = Utils.HashPassword(GeneratorPassword()),
                    UpdateDate = DateTime.Now
                });

                _context.Session.CommitTransaction();

                if (!SendMail(user.Email, _newPassword,user.UserName))
                {
                    return StatusCode(500, _excep.Throw("Có lỗi xảy ra khi gửi mật khẩu"));
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
        #region oldCode
        //[HttpPut]
        //[Route("api/users")]
        //public IActionResult Update([FromBody] ResetPasswordViewModel obj)
        //{
        //    var user = _context.Query<ResetPassword>().Where(u => u.UserName == obj.UserName || u.Email == obj.Email || u.PhoneNumber == obj.PhoneNumber && u.IsDelete==false).FirstOrDefault();
        //    //var secret = _context.Query<UserSecret>().Where(us => us.SecretCode == obj.SecretCode && us.UserId == user.UserId && us.IsDelete == false).FirstOrDefault();

        //    if (user == null)
        //    {
        //        return StatusCode(404, _excep.Throw("Khôi phục mật khẩu không thành công", "Tên đăng nhập, Email hoặc số điện thoại không đúng"));
        //    }
        //    //else if (obj.SecretCode != null)
        //    //{
        //    //    if (secret == null)
        //    //    {
        //    //        return StatusCode(406, _excep.Throw("Khôi phục mật khẩu không thành công", "Mã bí mật không đúng"));
        //    //    }
        //    //    if (secret.IsActive == false)
        //    //    {
        //    //        return StatusCode(406, _excep.Throw("Khôi phục mật khẩu không thành công", "Mã bí mật không còn hiệu lực"));
        //    //    }
        //    //}

        //    //if (Utils.VerifyHashedPassword(user.Password, obj.Password))
        //    //{
        //    //    return StatusCode(406, _excep.Throw("Khôi phục mật khẩu không thành công", "Mật khẩu mới không được trùng mật khẩu hiện tại"));
        //    //}

        //    try
        //    {
        //        _context.Session.BeginTransaction();

        //        //_context.Update<UserSecret>(us => us.Id == secret.Id, x => new UserSecret()
        //        //{
        //        //    IsDelete = true,
        //        //    IsActive = false
        //        //});

        //        _context.Update<ResetPassword>(u => u.UserId == user.UserId, x => new ResetPassword()
        //        {
        //            Password = Utils.HashPassword(GeneratorPassword())
        //        });

        //        _context.Session.CommitTransaction();
        //    }
        //    catch (Exception e)
        //    {
        //        if (_context.Session.IsInTransaction)
        //        {
        //            _context.Session.RollbackTransaction();
        //        }
        //        return StatusCode(500, _excep.Throw("Có lỗi xảy ra", e.Message));
        //    }
        //    return Json(new ActionResultDto());
        //}
        #endregion
        public string GeneratorPassword()
        {
            string newPassword;
            bool includeLowercase = true;
            bool includeNumeric = true;
            bool includeSpecial = true;
            bool includeUppercase = true;
            int lengthOfPassword = 10;

            const int MAXIMUM_IDENTICAL_CONSECUTIVE_CHARS = 2;
            const string LOWERCASE_CHARACTERS = "abcdefghijklmnopqrstuvwxyz";
            const string UPPERCASE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string NUMERIC_CHARACTERS = "0123456789";
            const string SPECIAL_CHARACTERS = @"!#$%&*@\";
            const int PASSWORD_LENGTH_MIN = 8;
            const int PASSWORD_LENGTH_MAX = 128;

            //if (lengthOfPassword < PASSWORD_LENGTH_MIN || lengthOfPassword > PASSWORD_LENGTH_MAX)
            //{
            //    return "Password length must be between 8 and 128.";
            //}

            string characterSet = "";

            if (includeLowercase)
            {
                characterSet += LOWERCASE_CHARACTERS;
            }

            if (includeUppercase)
            {
                characterSet += UPPERCASE_CHARACTERS;
            }

            if (includeNumeric)
            {
                characterSet += NUMERIC_CHARACTERS;
            }

            if (includeSpecial)
            {
                characterSet += SPECIAL_CHARACTERS;
            }

            char[] password = new char[lengthOfPassword];
            int characterSetLength = characterSet.Length;

            System.Random random = new System.Random();
            for (int characterPosition = 0; characterPosition < lengthOfPassword; characterPosition++)
            {
                password[characterPosition] = characterSet[random.Next(characterSetLength - 1)];

                bool moreThanTwoIdenticalInARow =
                    characterPosition > MAXIMUM_IDENTICAL_CONSECUTIVE_CHARS
                    && password[characterPosition] == password[characterPosition - 1]
                    && password[characterPosition - 1] == password[characterPosition - 2];

                if (moreThanTwoIdenticalInARow)
                {
                    characterPosition--;
                }
            }

            _newPassword = newPassword = string.Join(null, password);
            return newPassword;
        }

       

        public bool SendMail(string sendTo, string newPassword,string user)
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
                                                                                                 
                message.Body = "Xin chào " + user + "\nChúng tôi vừa nhận được yêu cầu thay đổi mật khẩu từ phía bạn. Mật khẩu mới của bạn là: " + newPassword + "\nĐể bảo mật, bạn vui lòng thay đổi mật khẩu sau khi đăng nhập và không tiết lộ cho bất kỳ cá nhân nào.";

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