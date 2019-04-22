using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("cats_nations")]
    public class Nation
    {
        public Nation()
        {
        }

        [Column(IsPrimaryKey = true)]
        public string NationCode { get; set; }

        public string NationName { get; set; }
        public int OrderNumber { get; set; }
        public bool IsActive { get; set; }
        public bool IsDelete { get; set; }
    }
}