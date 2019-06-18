using System;

namespace AdminServer.ViewModels
{
    public class ApplicationViewModel { }

    public class ApplicationInputViewModel
    {
        public int? ApplicationId { set; get; }
        public string ApplicationName { get; set; }
        public string Description { get; set; }

        // Audit
        public bool? IsDetele { get; set; }
        public virtual int? CreateUserId { get; set; }
        public DateTime? CreateDate { get; set; }
        public virtual int? UpdateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}