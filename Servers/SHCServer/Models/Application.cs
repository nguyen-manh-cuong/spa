using AdminServer.ViewModels;
using System;
using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("sys_applications")]
    public sealed class Application
    {
        public Application() { }

        public Application(ApplicationInputViewModel obj)
        {
            ApplicationName = obj.ApplicationName;
            Description     = obj.Description;
            CreateUserId    = obj.CreateUserId;
            CreateDate      = obj.CreateDate;

            if (obj.UpdateUserId != null)
            {
                UpdateUserId = obj.UpdateUserId;
            }

            if (obj.UpdateDate != null)
            {
                UpdateDate = obj.UpdateDate;
            }
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int ApplicationId { get; set; }

        public string ApplicationName { get; set; }
        public string Description { get; set; }

        // Audit
        public bool IsDelete { get; set; }
        public int? CreateUserId { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? UpdateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}