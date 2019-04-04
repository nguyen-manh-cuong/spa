using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("sys_healthfacilities_configs")]
    public class HealthFacilitiesConfigs : IEntity
    {
        public HealthFacilitiesConfigs()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { set; get; }
        public int? HealthFacilitiesId { set; get; }
        public int Values { set; get; }
        public string Code { set; get; }
    }
}