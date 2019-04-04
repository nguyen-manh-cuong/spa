using System;
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
            Id          = obj.Id;
            Name        = obj.Name;
            Description = obj.Description;
        }

        public int Id { set; get; }

        public string Name { set; get; }

        public string Description { set; get; }
    }

    public class GroupInputViewModel
    {
        public int? Id { set; get; }

        public string Name { set; get; }

        public string Description { set; get; }

        public static explicit operator int(GroupInputViewModel v)
        {
            throw new NotImplementedException();
        }
    }
}