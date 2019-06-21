using SHCServer.Models;

namespace SHCServer.ViewModels
{
    public class HealthFacilitiesUserViewModel : HealthFacilities
    {
        public HealthFacilitiesUserViewModel()
        {
            Check = false;
        }
        public bool? Check { get; set; }
    }
}