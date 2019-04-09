using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("sms_brands")]
    public class SmsBrands //: IEntity
    {
        public SmsBrands()
        {
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int SmsBrandId { set; get; }
        public string BrandName { set; get; }
        public string CPCode { set; get; }
        public string UserName { set; get; }
        public string PassWord { set; get; }
        public string URL { set; get; }
        public string ServiceId { set; get; }
}
}