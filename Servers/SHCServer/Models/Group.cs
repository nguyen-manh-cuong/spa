using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("sys_groups")]
    public class Group
    {
        public Group()
        {
        }

        public Group(GroupInputViewModel group)
        {
            GroupName = group.GroupName;
            Description = group.Description;
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int GroupId { get; set; }
        public int? ApplicationId { get; set; }
        public string GroupName { get; set; }
        public bool? IsDelete { get; set; }
        public bool? Fixed { get; set; }

        //public string Name { get; set; }

        public string Description { get; set; }

        [NotMapped]
        public IList<User> Users { get; set; }

        [NotMapped]
        public IList<Role> Roles { get; set; }
    }

    public class GroupMapBase<TUser> : EntityTypeBuilder<TUser> where TUser : Group
    {
        public GroupMapBase()
        {
            // Ignore(o => o.UserGroups);
            Property(o => o.GroupId).IsAutoIncrement().IsPrimaryKey();
        }
    }

    public class GroupMap : GroupMapBase<Group>
    {
        public GroupMap()
        {
            MapTo("sys_groups");
            // Ignore(a => a.UserGroups);
        }
    }
}