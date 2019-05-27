using Quartz;
using Quartz.Impl;

namespace SHCServer
{
    public class SendMail
    {
        public async static void Start()
        {
            ISchedulerFactory schedFact = new StdSchedulerFactory();
            IScheduler scheduler = await schedFact.GetScheduler();
            await scheduler.Start();

            IJobDetail job = JobBuilder.Create<EmailJob>().Build();

            ITrigger trigger = TriggerBuilder.Create().WithDailyTimeIntervalSchedule(s => s.WithIntervalInMinutes(15).OnEveryDay().StartingDailyAt(TimeOfDay.HourAndMinuteOfDay(14, 15))).Build();

            await scheduler.ScheduleJob(job, trigger);
        }

        //public static void SendMailResetPassword(string fromMail, string toMail, string passwordOfFromMail, string hostName, int portNumber, bool ssl = true)
        //{
        //    MailMessage mail = new MailMessage(fromMail, toMail);
        //    SmtpClient client = new SmtpClient();
        //    client.Port = portNumber;
        //    client.DeliveryMethod = SmtpDeliveryMethod.Network;
        //    client.UseDefaultCredentials = false;
        //    client.Credentials = new System.Net.NetworkCredential(fromMail, passwordOfFromMail);
        //    client.EnableSsl = ssl;
        //    client.Host = hostName;
        //    mail.BodyEncoding = System.Text.UTF8Encoding.UTF8;
        //    mail.DeliveryNotificationOptions = DeliveryNotificationOptions.OnFailure;
        //    mail.Subject = "Yêu cầu thay đổi mật khẩu";
        //    mail.Body = $"<a href=\"google.com\">google.com</a>";
        //    client.Send(mail);
        //}
    }
}