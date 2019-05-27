using System;
using Viettel.Annotations;
using Viettel.Entity;

namespace SHCServer.Models
{
    public class UserBase : IEntity
    {
        [Column(IsPrimaryKey = true)]
        [AutoIncrement]
        public virtual int Id { get; set; }

        public string UserName { get; set; }
        public virtual string Password { get; set; }
        public string PasswordLog { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public int AccountType { get; set; }
        public int Sex { get; set; }
        public DateTime? BirthDay { get; set; }
        public DateTime? UpdateDate { get; set; }
        public DateTime? CreateDate { get; set; }
        public bool? Status { get; set; }

        // Location
        public string ProvinceCode { get; set; }

        public string DistrictCode { get; set; }
        public string WardCode { get; set; }
        public string Address { get; set; }

        // Other
        public int? Register { get; set; }

        public string MedicalCode { get; set; }
        public string MedicalCodeRelatives { get; set; }
        public string Identification { get; set; }
        public string Insurrance { get; set; }
        public string WorkPlace { get; set; }
        public string HealthFacilitiesName { get; set; }
        public int? Specialist { get; set; }

        public int? HealthFacilitiesId { get; set; }
        public bool? IsDelete { get; set; }
    }

    [Table("sys_users")]
    public class User : UserBase
    {
        // [NotMapped] public virtual IList<string> UserGroups { get; set; }

        public User(User user) : this()
        {
            UserName = user.UserName;
            Password = user.Password;
            FullName = user.FullName;
            Email = user.Email;
            AccountType = user.AccountType;
            ProvinceCode = user.ProvinceCode;
            DistrictCode = user.DistrictCode;
            WardCode = user.WardCode;
            Address = Address;
        }

        public User()
        {
        }
    }

    public class UserMapBase<TUser> : EntityTypeBuilder<TUser> where TUser : User
    {
        public UserMapBase()
        {
            // Ignore(o => o.UserGroups);
            Property(o => o.Id).IsAutoIncrement().IsPrimaryKey();
        }
    }

    public class UserMap : UserMapBase<User>
    {
        public UserMap()
        {
            MapTo("sys_users");
            // Ignore(a => a.UserGroups);
        }
    }
}