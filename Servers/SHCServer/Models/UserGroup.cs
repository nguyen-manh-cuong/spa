using System.ComponentModel.DataAnnotations;
using Viettel.Annotations;


namespace SHCServer.Models
{
    [Table("sys_users_groups")]
    public class UserGroup
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }

        public virtual User User { get; set; }

        public int GroupId { get; set; }

        public virtual Group Group { get; set; }
    }
}
