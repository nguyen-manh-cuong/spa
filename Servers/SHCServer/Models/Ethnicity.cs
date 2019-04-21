using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("cats_ethnicity")]
    public class Ethnicity
    {
        public Ethnicity()
        {
        }

        public string EthnicityCode { get; set; }
        public string Name { get; set; }
        public int OrderNumber { get; set; }
        public bool IsDelete { get; set; }
        public bool IsActive { get; set; }
    }
}