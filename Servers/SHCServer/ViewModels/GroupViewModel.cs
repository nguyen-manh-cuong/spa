using System;
using System.Collections.Generic;
using SHCServer.Models;

namespace SHCServer.ViewModels
{
    public class GroupViewModel
    {
        public GroupViewModel()
        {
        }

        public GroupViewModel(Group obj) : this()
        {
            Id          = obj.GroupId;
            Name        = obj.GroupName;
            Description = obj.Description;
        }

        public int Id { set; get; }

        public string Name { set; get; }

        public string Description { set; get; }
    }

    public class GroupInputViewModel
    {
        public int? GroupId { set; get; }
        public int ApplicationId { set; get; }
        public string GroupName { set; get; }
        public string Description { set; get; }

        // Audit
        public bool? IsDetele { get; set; }
        public virtual int? CreateUserId { get; set; }
        public DateTime? CreateDate { get; set; }
        public virtual int? UpdateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int Fixed { get; set; }
    }
}