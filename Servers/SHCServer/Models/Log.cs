using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("sys_logs")]
    public class Log
    {
        public int LogId { get; set; }
        public string LogType { get; set; }
        public int AppCode { get; set; }
        public DateTime? EvenDate { get; set; }
        public DateTime? Duration { get; set; }
        public int? UserId { get; set; }
        public int? HealthFacilitiesId { get; set; }
        public string Path { get; set; }
        public string IpAddress { get; set; }
        public string Function { get; set; }
        public string Description { get; set; }
        public string ErrorCode { get; set; }
        public string ParamList { get; set; }
        public string Class { get; set; }
        public bool Result { get; set; }
    }
}
