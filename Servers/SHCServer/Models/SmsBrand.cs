using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("sms_brands")]
    public class SmsBrand
    {
        public int SmsBrandId { get; set; }
        public string BrandName { get; set; }
        public string Description { get; set; }
        public string URL { get; set; }
        public string CPCode { get; set; }
        public string ServiceId { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public bool IsDelete { get; set; }
        public bool IsActive { get; set; }
        public int? CreateUserId { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? UpdateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
