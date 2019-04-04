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
    }
}