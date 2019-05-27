using Quartz;
using SHCServer.Models;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Viettel;
using Viettel.MySql;

namespace SHCServer
{
    public class EmailJob : IJob
    {
        public Task Execute(IJobExecutionContext context)
        {
            DbContext _context = new MySqlContext(new MySqlConnectionFactory("server=localhost;port=3306;database=smarthealthcare;user=root;password=64688990;CharSet=utf8;"));
            var users = _context.Query<User>().Where(q => q.IsDelete == false && q.Status == true).ToList();

            foreach (var item in users)
            {
                TimeSpan time = item.UpdateDate != null ? (TimeSpan)(DateTime.Now - item.UpdateDate) : (TimeSpan)(DateTime.Now - item.CreateDate);
                int timeUpdated = time.Days;

                if (timeUpdated <= 90 && timeUpdated >= 75)
                {
                    using (var message = new MailMessage("trungngoc@dichthuatvantin.com", item.Email))
                    {
                        message.Subject = "Yêu cầu thay đổi mật khẩu";
                        message.Body = "Viettel - Datetime: " + DateTime.Now;

                        using (SmtpClient client = new SmtpClient
                        {
                            EnableSsl = true,
                            Host = "smtp.googlemail.com",
                            Port = 587,
                            Credentials = new NetworkCredential("trungngoc@dichthuatvantin.com", "NgocLong90")
                        })
                        {
                            client.Send(message);
                        }
                    }
                }
                else if (timeUpdated > 90)
                {
                    _context.Session.BeginTransaction();
                    _context.Update<User>(b => b.UserName == item.UserName, a => new User() { Status = false });
                    _context.Session.CommitTransaction();
                }
            }
            return null;
        }
    }
}