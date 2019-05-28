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

            var specialist = context.JoinQuery<DoctorSpecialists, CategoryCommon>((d, c) => new object[]
                {
                    JoinType.InnerJoin, d.SpecialistCode == c.Code
                })
                .Where((d, c) => d.DoctorId == obj.DoctorId && d.SpecialistCode == obj.SpecialistCode && c.IsDelete == false && c.IsActive == true)
                .Select((d, c) => c).FirstOrDefault();

            //Specialist = specialist != null ? (specialist.Name) : "";

            if (specialist != null)
            {
                SpecialistCode = specialist.Code;
                Specialist = specialist.Name;
            }
            else
            {
                SpecialistCode = null;
                Specialist = "";
            }

            Name = specialist != null ? specialist.Name : "";
        }

        public int DoctorId { set; get; }
        public string SpecialistCode { set; get; }
        public string Specialist { set; get; }
        public string Name { get; set; }
    }
}