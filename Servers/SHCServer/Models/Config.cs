 using System;
using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("sys_configs")]
    public class Config : IEntity
    {
        public Config()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { set; get; }
        public string Code { set; get; }
        public string Values { set; get; }
        public string Description { get; set; }

        //audi
        public bool IsDelete { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? CreateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int? UpdateUserId { get; set; }
    }
}