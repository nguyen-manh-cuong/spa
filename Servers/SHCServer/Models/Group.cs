using System.Collections.Generic;
using SHCServer.ViewModels;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    [Table("sys_groups")]
    public class Group: IEntity
    {
        public Group()
        {
        }

        public Group(GroupInputViewModel group)
        {
            Name = group.Name;
            Description = group.Description;
        }

        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public int Id { get; set; }

        public string Name { get; set; }

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
            Property(o => o.Id).IsAutoIncrement().IsPrimaryKey();
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