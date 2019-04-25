using SHCServer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Viettel;
using Viettel.MySql;



namespace SHCServer.ViewModels
{
    public class BookingInformationsViewModel
    {
        protected DbContext context;

        public BookingInformationsViewModel()
        {

        }

        public BookingInformationsViewModel(BookingInformations bookingInformations, string connectionString) : this()
        {
            context = new MySqlContext(new MySqlConnectionFactory(connectionString));
            BookingId = bookingInformations.BookingId;
            Status = bookingInformations.Status;
            Gender = bookingInformations.Gender;
            ExaminationDate = bookingInformations.ExaminationDate;
            #region get HealthFacilitiesName
            var HealthFacilities = context.JoinQuery<BookingInformations, HealthFacilities>((b, h) => new object[]
                     {
                            JoinType.InnerJoin, b.HealthFacilitiesId == h.HealthFacilitiesId
                     })
                      .Where((b, h) => b.BookingId == bookingInformations.BookingId)
                      .Select((b, h) => h).FirstOrDefault();
            if (HealthFacilities != null)
            {
                HealthFacilitiesName = HealthFacilities.Name;
            }
            else
            {
                HealthFacilitiesName = "";
            }
            #endregion

            #region get DoctorName
            var Doctor = context.JoinQuery<BookingInformations, Doctor>((b, d) => new object[]
                     {
                            JoinType.InnerJoin, b.DoctorId == d.DoctorId
                     })
                      .Where((b, h) => b.BookingId == bookingInformations.BookingId)
                      .Select((b, h) => h).FirstOrDefault();
            if (Doctor != null)
            {
                DoctorName = Doctor.FullName;
            }
            else
            {
                DoctorName = "";
            }

            #endregion
            
           
            var bookingInformation = context.Query<BookingInformations>().ToList();
             #region COUNT BY DOCTOR
            var q = from b in bookingInformation
                    where b.DoctorId.Equals(bookingInformations.DoctorId)
                    select b;
            Quantity = q.Count();
            #endregion

            #region COUNT BY GENDER MALE
            var g = from b in bookingInformation
                    where b.Gender == 1
                    select b;
            QuantityByGenderMale = g.Count();
            #endregion

            #region COUNT BY GENDER FEMALE
            var r = from b in bookingInformation
                    where b.Gender == 2
                    select b;
            QuantityByGenderFemale = r.Count();
            #endregion

            #region COUNT BY STATUS
            // Mới đang ký
            var m = from b in bookingInformation
                    where b.Status == 0
                    select b;
            QuantityByStatusNew = m.Count();
            //Chờ khám
            var p = from b in bookingInformation
                    where b.Status == 1
                    select b;
            QuantityByStatusPending = p.Count();
            // Đã khám
            var f = from b in bookingInformation
                    where b.Status == 2
                    select b;
            QuantityByStatusDone = f.Count();
             //Hủy khám
             var c = from b in bookingInformation
                    where b.Status == 3
                    select b;
            QuantityByStatusCancel = c.Count();
            

          
            #endregion


        }




        public int BookingId { set; get; }
        public string TicketId { set; get; }
        //public int BookingType { set; get; }
        //public int BookingSource { set; get; }
        public string BookingRepresent { set; get; }
        public string PhoneRepresent { set; get; }
        public string EmailRepresent { set; get; }
        public int RelationshipId { set; get; }
        public string BookingUser { set; get; }
        public string PhoneNumber { set; get; }
        public string Email { set; get; }
        public int? Gender { set; get; }
        public int? BirthDate { set; get; }
        public int? BirthMonth { set; get; }
        public int BirthYear { set; get; }
        public string Address { set; get; }
        public string ProvinceCode { set; get; }
        public string DistrictCode { set; get; }
        public string Reason { set; get; }
        public string ProvinceCodeExamination { set; get; }
        public string DistrictCodeExamination { set; get; }
        public int HealthFacilitiesId { set; get; }
        public string HealthFacilitiesName { get; set; }
        public int? DoctorId { set; get; }
        public string DoctorName { get; set; }
        public DateTime ExaminationDate { set; get; }
        public string ExaminationTime { set; get; }
        public int? ExaminationWorkingTime { set; get; }
        public int? TimeSlotId { set; get; }
        public int Status { set; get; }
        public DateTime CreateDate { set; get; }
        public int? BookingServiceType { get; set; }
        public int Quantity { get; set; }
        public int QuantityByGenderMale { get; set; }
        public int QuantityByGenderFemale { get; set; }
        public int QuantityByStatusNew { get; set; }
        public int QuantityByStatusPending { get; set; }
        public int QuantityByStatusCancel { get; set; }
        public int QuantityByStatusDone { get; set; }

    }

    public class BookingInformationsInputViewModel
    {
        public string address {set; get; }
        public string doctorName { set; get; }
        public string bookingRepresent { set; get; }
        public int gender { set; get; }
        public string bookingUser { set; get; }
        public string email { set; get; }
        public int bookingId { set; get; }
        public string reason { set; get; }
        public string reasonReject { set; get; }
        public string phoneNumber { set; get; }
        public string phoneRepresent { set; get; }
        public string emailRepresent { set; get; }
        public int status { set; get; }
        public string age { set; get; }
        public string examinationDate { set; get; }
        public int updateUserId { set; get; }

        public static explicit operator int(BookingInformationsInputViewModel v)
        {
            throw new NotImplementedException();
        }
    }
}
