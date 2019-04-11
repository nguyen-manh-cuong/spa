using SHCServer.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace SHCServer.ViewModels
{
    public class CategoryCommonViewModel
    {
        public CategoryCommonViewModel()
        {
        }

        public CategoryCommonViewModel(CategoryCommon cc): this()
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

    public class CategoryCommonInputViewModel
    {
        public int? Id { set; get; }
        public string Name { set; get; }
        public string Code { set; get; }
        public string Type { set; get; }
        public DateTime? CreateDate { set; get; }
        public DateTime? UpdateDate { get; set; }
        public int? UpdateUserId { get; set; }
        public int? CreateUserId { get; set; }
        public bool IsDelete { set; get; }
        public bool IsActive { get; set; }
    }
}
