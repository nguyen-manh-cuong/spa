using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("sys_users_secret")]
    public class UserSecret
    {
        public UserSecret()
        {

        }
        public int Id { get; set; }
        public int UserId { get; set; }
        public string SecretCode { get; set; }
        public int? CreateUserId { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? UpdateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsDelete { get; set; }
    }
}
