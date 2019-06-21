using System;
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

            Groups = context.JoinQuery<UserGroup, Group>((userGroup, g) => new object[] { JoinType.LeftJoin, userGroup.GroupId == g.GroupId })
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
        //public List<UserHealthFacilities> UserHealthFacilities { get; set; }
        public string Locality { set; get; }
        public string AccountTypeName { set; get; }
        public string GroupName { get; set; }
        public string LisenceCode { get; set; }
        public string CertificationCode { get; set; }
        public int? StatusSHC { get; set; }

        public IList<GroupViewModel> Groups { get; set; }
    }

    public sealed class UserInputViewModel : UserBase
    {
        public int? Reset { get; set; }
        public int? ApplicationId { get; set; }
        public UserInputViewModel() { }

        public UserInputViewModel(User obj) : this()
        {
            UserId = obj.UserId;
            UserName = obj.UserName;
            FullName = obj.FullName;
            Email = obj.Email;

            if (!string.IsNullOrEmpty(obj.Password))
            {
                Password = Utils.HashPassword(obj.Password);
            }
        }

        public GroupInputViewModel[] Groups { get; set; }

        public bool? isUsingDoctor { get; set; }
        public bool? isUsingCall { get; set; }
        public bool? isUsingUpload { get; set; }
        public bool? isUsingRegister { get; set; }
        public bool? isUsingVideo { get; set; }
        public bool? isUsingExamination { get; set; }
        /// <summary>
        /// pro common
        /// </summary>
        public int? CreateUserId { get; set; }
        public int? UpdateUserId { get; set; }
        public string CertificationCode { get; set; }
        public string LisenceCode { get; set; }
        public string GroupId { get; set; }
        public string healthId { get; set; }
        public string ImageFileOld { get; set; }
    }
}