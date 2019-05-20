using System;
using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("sys_users_services")]
    public class UsersServices
    {
        public UsersServices()
        {
        }
        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { set; get; }
        public int UserId { get; set; }
        public bool? IsUsingdoctor { get; set; }
        public bool? IsUsingCall { get; set; }
        public bool? IsUsingUpload { get; set; }
        public bool? IsUsingRegister { get; set; }
        public bool? IsUsingVideo { get; set; }
        public bool? IsUsingExamination { get; set; }

        /// <summary>
        /// pro common
        /// </summary>
        public bool IsDelete { get; set; }
        public int? CreateUserId { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? UpdateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }        
    }

}