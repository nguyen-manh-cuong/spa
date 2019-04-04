using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("cats_provinces")]
    public class Province
    {
        [Column(IsPrimaryKey = true)]
        public string ProvinceCode { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
    }

    [Table("cats_districts")]
    public class District
    {
        [Column(IsPrimaryKey = true)]
        public string DistrictCode { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string ProvinceCode { get; set; }
    }

    [Table("cats_wards")]
    public class Ward
    {
        [Column(IsPrimaryKey = true)]
        public string WardCode { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string DistrictCode { get; set; }
    }
}