using System;
using System.Collections.Generic;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("sys_users_healthfacilities")]
    public class UserHealthFacilities : IEntity
    {
        public UserHealthFacilities()
        {

        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public virtual int Id { get; set; }
        public int UserId { get; set; }
        public int HealthFacilitiesId { get; set; }
        public bool IsDefault { get; set; }
        public bool IsDelete { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? CreateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int? UpdateUserId { get; set; }
    }
}