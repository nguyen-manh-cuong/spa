using System.Collections.Generic;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class UserViewModel: UserBase
    {
        protected DbContext context;

        public UserViewModel()
        {
            Groups = new List<GroupViewModel>();
        }

        public UserViewModel(User user, string connectionString) : this()
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));

            Id = user.Id;
            UserName = user.UserName;
            FullName = user.FullName;
            Email = user.Email;
            Sex = user.Sex;
            PhoneNumber = user.PhoneNumber;
            BirthDay = user.BirthDay;
            AccountType = user.AccountType;

            ProvinceCode = user.ProvinceCode;
            DistrictCode = user.DistrictCode;
            WardCode = user.WardCode;
            Address = user.Address;

            Groups = context.JoinQuery<UserGroup, Group>((userGroup, g) => new object[] { JoinType.LeftJoin, userGroup.GroupId == g.Id })
                             .Where((u, g) => u.UserId == user.Id)
                             .Select((u, g) => new GroupViewModel(g))
                             .ToList();

            if (!string.IsNullOrEmpty(user.ProvinceCode)) Locality = context.Query<Province>().FirstOrDefault(o => o.ProvinceCode == user.ProvinceCode).Name;
            if (!string.IsNullOrEmpty(user.DistrictCode)) Locality = $"{Locality} - {context.Query<District>().FirstOrDefault(o => o.DistrictCode == user.DistrictCode).Name}";
            if (!string.IsNullOrEmpty(user.WardCode)) Locality = $"{Locality} - {context.Query<Ward>().FirstOrDefault(o => o.WardCode == user.WardCode).Name}";

            Locality = (!string.IsNullOrEmpty(Locality) ? Locality + " - " : "") + user.Address;

            // Other
            Register = user.Register;
            MedicalCode = user.MedicalCode;
            MedicalCodeRelatives = user.MedicalCodeRelatives;
            Identification = user.Identification;
            Insurrance = user.Insurrance;
            WorkPlace = user.WorkPlace;
            HealthFacilitiesName = user.HealthFacilitiesName;
            Specialist = user.Specialist;
            HealthFacilitiesId = user.HealthFacilitiesId;
        }

        public override int Id { set; get; } 

        public string Locality { set; get; }

        public IList<GroupViewModel> Groups { get; set; }
    }

    public sealed class UserInputViewModel : UserBase

    {
        public UserInputViewModel()
        {
        }

        public UserInputViewModel(User obj) : this()
        {
            Id = obj.Id;
            UserName = obj.UserName;
            FullName = obj.FullName;
            Email = obj.Email;

            if (!string.IsNullOrEmpty(obj.Password)) Password = Utils.HashPassword(obj.Password);
        }

        public GroupInputViewModel[] Groups { get; set; }
    }
}