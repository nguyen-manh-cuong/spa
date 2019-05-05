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
        public bool? isUsingdoctor { get; set; }
        public bool? isUsingCall { get; set; }
        public bool? isUsingUpload { get; set; }
        public bool? isUsingRegister { get; set; }
        public bool? isUsingVideo { get; set; }
        public bool? isUsingExamination { get; set; }

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