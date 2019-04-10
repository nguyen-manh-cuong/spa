using System;
using System.Collections.Generic;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class HealthFacilitiesViewModel
    {
        protected DbContext context;

        public HealthFacilitiesViewModel()
        {
        }

        public HealthFacilitiesViewModel(HealthFacilities obj, string connectionString) : this()
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));

            HealthFacilitiesId = obj.HealthFacilitiesId;
            Name = obj.Name;
            Code = obj.Code;
            DistrictCode = obj.DistrictCode;
            ProvinceCode = obj.ProvinceCode;
            Specialist = obj.Specialist;
            Address = obj.Address;
            IsActive = obj.IsActive;
            IsDelete = obj.IsDelete;

            var common = context.JoinQuery<HealthFacilities, CategoryCommon>((h, c) => new object[]
                {
                    JoinType.InnerJoin, h.Specialist == c.Id
                })
                .Where((h, c) => h.HealthFacilitiesId == obj.HealthFacilitiesId)
                .Select((h, c) => c).FirstOrDefault();

            SpecialistName = common != null ? common.Name : "";

            totalDoctor = context.Query<HealthFacilitiesDoctors>().Where(o => o.HealthFacilitiesId == obj.HealthFacilitiesId).Count();
        }

        public int HealthFacilitiesId { set; get; }
        public string Name { set; get; }
        public string Code { set; get; }
        public string DistrictCode { set; get; }
        public string ProvinceCode { set; get; }
        public string Address { set; get; }
        public string SpecialistName { set; get; }
        public int? Specialist { set; get; }        
        public int totalDoctor { set; get; }
        public bool IsActive { set; get; }
        public bool IsDelete { set; get; }
    }
}