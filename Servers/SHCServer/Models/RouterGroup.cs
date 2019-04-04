using System.ComponentModel.DataAnnotations;
using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("sys_routers_groups")]
    public class RouterGroup
    {
        [Key] public int Id { get; set; }
        public int RouterId { get; set; }
        public virtual Router Router { get; set; }
        public int GroupId { get; set; }
        public virtual Group Group { get; set; }
    }
}