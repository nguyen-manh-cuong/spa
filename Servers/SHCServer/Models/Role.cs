using Microsoft.AspNetCore.Identity;

namespace SHCServer.Models
{
    public sealed class Role : IdentityRole
    {
        public Role()
        {
        }

        public Role(string name, string description) : base(name)
        {
            Description = description;
            Flag        = 0;
        }

        public Role(string name, string description, int flag) : base(name)
        {
            Description = description;
            Flag        = flag;
        }

        public string Description { get; set; }

        public int Flag { get; set; }
    }
}