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
        }

        public int Id { set; get; }
        public string Name { set; get; }
        public string Code { set; get; }
        public string Type { set; get; }
        public string IsDelete { set; get; }
        public string CreateDate { set; get; }
    }

    public class CategoryCommonInputViewModel
    {
        public int? Id { set; get; }
        public string Name { set; get; }
        public string Code { set; get; }
        public string Type { set; get; }
        public string IsDelete { set; get; }
        public string CreateDate { set; get; }
    }


}
