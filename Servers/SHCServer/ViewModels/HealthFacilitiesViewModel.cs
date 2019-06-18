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
            Address = obj.Address;
            IsActive = obj.IsActive;
            IsDelete = obj.IsDelete;

            Specialist = context.JoinQuery<HealthFacilities, HealthFacilitiesSpecialists>((d, ds) => new object[]
                {
                    JoinType.InnerJoin, d.HealthFacilitiesId == ds.HealthFacilitiesId
                })
                .Where((d, hs) => d.HealthFacilitiesId == obj.HealthFacilitiesId)
                .Select((d, hs) => new HealthFacilitiesSpecialistsViewModel(hs, connectionString)).ToList();

            TotalDoctor = context.Query<HealthFacilitiesDoctors>().Where(o => o.HealthFacilitiesId == obj.HealthFacilitiesId).Count();
        }

        public int? HealthFacilitiesId { set; get; }
        public string Name { set; get; }
        public string Code { set; get; }
        public string DistrictCode { set; get; }
        public string ProvinceCode { set; get; }
        public string Address { set; get; }  
        public List<HealthFacilitiesSpecialistsViewModel> Specialist { set; get; }
        public int? TotalDoctor { set; get; }
        public bool? IsActive { set; get; }
        public bool? IsDelete { set; get; }
        public bool? Checked { set; get; }
    }
}