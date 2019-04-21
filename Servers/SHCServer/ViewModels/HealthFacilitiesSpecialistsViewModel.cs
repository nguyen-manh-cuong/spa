using System;
using System.Collections.Generic;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;


namespace SHCServer.Models
{
    public class HealthFacilitiesSpecialistsViewModel
    {
        protected DbContext context;

        public HealthFacilitiesSpecialistsViewModel()
        {
        }

        public HealthFacilitiesSpecialistsViewModel(HealthFacilitiesSpecialists obj, string connectionString)
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));

            HealthFacilitiesId = obj.HealthFacilitiesId;
            SpecialistCode = obj.SpecialistCode;

            var specialist = context.JoinQuery<HealthFacilitiesSpecialists, CategoryCommon>((h, c) => new object[]
                {
                    JoinType.InnerJoin, h.SpecialistCode == c.Code
                })
                .Where((h, c) => h.HealthFacilitiesId == obj.HealthFacilitiesId && h.SpecialistCode == obj.SpecialistCode)
                .Select((h, c) => c).FirstOrDefault();

            Specialist = specialist != null ? specialist.Name : "";
        }

        public int HealthFacilitiesId { set; get; }
        public string SpecialistCode { set; get; }
        public string Specialist { set; get; }
    }
}