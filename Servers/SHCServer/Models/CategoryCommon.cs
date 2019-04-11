using SHCServer.ViewModels;
using System;
using System.Collections.Generic;
using System.Text;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("cats_common")]
    public class CategoryCommon : IEntity
    {
        public CategoryCommon()
        {
        }

        public CategoryCommon(CategoryCommonViewModel cc)
        {
            Id = cc.Id;
            Name = cc.Name;
            Code = cc.Code;
            Type = cc.Type;
            IsDelete = cc.IsDelete;
            CreateDate = cc.CreateDate;
            UpdateDate = cc.UpdateDate;
            CreateUserId = cc.CreateUserId;
            UpdateUserId = cc.UpdateUserId;
            IsActive = cc.IsActive;
            IsDelete = cc.IsDelete;
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { set; get; }
        public string Code { set; get; }
        public string Name { set; get; }
        public string Type { set; get; }
        public bool IsActive { get; set; }
        public bool IsDelete { set; get; }
        public DateTime CreateDate { set; get; }
        public DateTime? UpdateDate { get; set; }
        public int? CreateUserId { get; set; }
        public int? UpdateUserId { get; set; }
    }

    public class CategoryCommonMapBase<TUser> : EntityTypeBuilder<TUser> where TUser : CategoryCommon
    {
        public CategoryCommonMapBase()
        {
            // Ignore(o => o.UserGroups);
            Property(o => o.Id).IsAutoIncrement().IsPrimaryKey();
        }
    }
    public class CategoryCommonChungMap : CategoryCommonMapBase<CategoryCommon>
    {
        public CategoryCommonChungMap()
        {
            MapTo("sys_category_common");
            // Ignore(a => a.UserGroups);
        }
    }
}
