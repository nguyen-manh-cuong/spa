using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("sys_routers")]
    public class Router : IEntity
    {
        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public virtual int Id { get; set; }
        public string ApplicationName { get; set; }
        public string DownstreamPathTemplate { get; set; }
        public string DownstreamScheme { get; set; }
        public string UpstreamPathTemplate { get; set; }
        public string UpstreamHttpMethod { get; set; }
        public string ServiceTitle { get; set; }
        public string SwaggerKey { get; set; }
    }
}
