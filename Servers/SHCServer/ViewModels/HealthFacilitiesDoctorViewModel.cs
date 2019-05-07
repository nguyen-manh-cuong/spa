using SHCServer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class HealthFacilitiesDoctorViewModel
    {
        protected DbContext context;
        public HealthFacilitiesDoctorViewModel()
        {

        }
        public HealthFacilitiesDoctorViewModel(HealthFacilitiesDoctors obj, string connectionString):this()
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));
            var healthFacilities = context.JoinQuery<HealthFacilitiesDoctors, HealthFacilities>((hf, h) => new object[]
               {
                JoinType.InnerJoin,hf.HealthFacilitiesId==h.HealthFacilitiesId
               })
            .Where((hf, h) => hf.DoctorId == obj.DoctorId && hf.HealthFacilitiesId == obj.HealthFacilitiesId && h.IsDelete == false && h.IsActive == true)
            .Select((hf,h)=>h).FirstOrDefault();

            Name = healthFacilities != null ? healthFacilities.Name : "";

            HealthFacilitiesId = obj.HealthFacilitiesId;
            DoctorId = obj.DoctorId;
        }

        public int? HealthFacilitiesId { set; get; }
        public string Name { get; set; }
        public int DoctorId { get; set; }
    }
}
