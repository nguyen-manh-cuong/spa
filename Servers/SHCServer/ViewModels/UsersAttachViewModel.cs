using System;

namespace SHCServer.Models
{
    public class UsersAttachViewModel
    {
        public int? UserId { get; set; }
        public string Path { get; set; }
        public string Type { get; set; }
        public DateTime? UpdateDate { get; set; }
        public DateTime? CreateDate { get; set; }
        public int? CreateUserId { get; set; }
        public int? UpdateUserId { get; set; }
        public bool? IsDelete { get; set; }
    }
}