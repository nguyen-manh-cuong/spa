using System;
using System.Collections.Generic;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;


namespace SHCServer.Models
{
    public class DoctorSpecialistsViewModel
    {
        protected DbContext context;

        public DoctorSpecialistsViewModel()
        {
        }

        public DoctorSpecialistsViewModel(DoctorSpecialists obj, string connectionString)
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));

            DoctorId = obj.DoctorId;
            SpecialistCode = obj.SpecialistCode;

            var specialist = context.JoinQuery<DoctorSpecialists, CategoryCommon>((d, c) => new object[]
                {
                    JoinType.InnerJoin, d.SpecialistCode == c.Code
                })
                .Where((d, c) => d.DoctorId == obj.DoctorId && d.SpecialistCode == obj.SpecialistCode)
                .Select((d, c) => c).FirstOrDefault();

            Specialist = specialist != null ? specialist.Name : "";
        }

        public int DoctorId { set; get; }
        public string SpecialistCode { set; get; }
        public string Specialist { set; get; }
    }
}