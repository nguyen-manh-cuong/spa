using System;
using System.Collections.Generic;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class DoctorViewModel
    {
        protected DbContext context;

        public DoctorViewModel()
        {
        }

        public DoctorViewModel(Doctor obj, string connectionString) : this()
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));

            DoctorId = obj.DoctorId;
            FullName = obj.FullName;
            Avatar = obj.Avatar;
            AcademicId = obj.AcademicId;
            DegreeId = obj.DegreeId;
            Description = obj.Description;

            var academic = context.JoinQuery<Doctor, CategoryCommon>((d, c) => new object[]
                {
                    JoinType.InnerJoin, d.AcademicId == c.Id
                })
                .Where((d, c) => d.DoctorId == obj.DoctorId)
                .Select((d, c) => c).FirstOrDefault();

            var degree = context.JoinQuery<Doctor, CategoryCommon>((d, c) => new object[]
                {
                    JoinType.InnerJoin, d.DegreeId == c.Id
                })
                .Where((d, c) => d.DoctorId == obj.DoctorId)
                .Select((d, c) => c).FirstOrDefault();

            Specialist = context.JoinQuery<Doctor, DoctorSpecialists>((d, ds) => new object[]
                {
                    JoinType.InnerJoin, d.DoctorId == ds.DoctorId
                })
                .Where((d, ds) => d.DoctorId == obj.DoctorId)
                .Select((d, ds) => new DoctorSpecialistsViewModel(ds, connectionString)).ToList();

            Academic = academic != null ? academic.Name : "";
            Degree = degree != null ? degree.Name : "";


        }

        public int DoctorId { set; get; }
        public string FullName { set; get; }
        public string Avatar { set; get; }
        public string Academic { set; get; }
        public string Degree { set; get; }
        public List<DoctorSpecialistsViewModel> Specialist { set; get; }
        public int? AcademicId { set; get; }
        public int? DegreeId { set; get; }
        public string Description { set; get; }
    }
}