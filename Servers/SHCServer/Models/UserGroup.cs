using System;
using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("sys_users_groups")]
    public class UserGroup
    {
        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { get; set; }

        public int UserId { get; set; }

        public virtual User User { get; set; }

        public int GroupId { get; set; }
        public int ApplicationId { get; set; }

        public virtual Group Group { get; set; }
        public DateTime? UpdateDate { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? CreateUserId { get; set; }
        public int? UpdateUserId { get; set; }
        public bool? IsDelete { get; set; }
    }
}