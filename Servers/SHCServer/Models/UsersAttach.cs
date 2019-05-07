using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("sys_users_attachs")]
    public class UsersAttach
    {
        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { get; set; }

        public int UserId { get; set; }
        public string Path { get; set; }
        public string Type { get; set; }
    }
}