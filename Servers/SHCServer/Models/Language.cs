using SHCServer.Controllers;
using Viettel.Annotations;

namespace SHCServer.Models
{
    [Table("sys_languages")]
    public class Language
    {
        public Language()
        {
        }

        public Language(LanguageInputViewModel obj)
        {
            Key = obj.Key;
            Page = obj.Page;
            Vi = obj.Vi;
            En = obj.En;
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { get; set; }
        public string Key { get; set; }
        public string Page { get; set; }
        public string Vi { get; set; }
        public string En { get; set; }
    }
}