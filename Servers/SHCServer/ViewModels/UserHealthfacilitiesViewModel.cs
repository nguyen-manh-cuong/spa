using System;
using System.Collections.Generic;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class UserHealthfacilitiesViewModel
    {
        protected DbContext context;

        public UserHealthfacilitiesViewModel()
        {
        }

        public UserHealthfacilitiesViewModel(UserHealthFacilities uh, HealthFacilities h) : this()
        {
            HealthFacilitiesId = h.HealthFacilitiesId;
            Name = h.Name;
            Address = h.Address;
            IsDefault = uh.IsDefault;
        }

        public int HealthFacilitiesId { set; get; }
        public string Name { set; get; }
        public string Address { set; get; }
        public bool IsDefault { set; get; }
}

    public class UserHealthfacilitiesInputViewModel
    {
        public int? healthFacilitiesIdOld { set; get; }
        public int HealthFacilitiesId { set; get; }
        public int UserId { set; get; }
    }
}