using System;

namespace SHCServer.ViewModels
{
    public class UserLoginViewModel
    {
        public int? Id { get; set; }
        public int? Counter { get; set; }
        public DateTime? LockedTime { get; set; }
        public int? Status { get; set; }
        public DateTime? ExpriredDate { get; set; }
        public int? MdmStatus { get; set; }
    }
}