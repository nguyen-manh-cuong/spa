using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SHCServer
{
    public class ActionResultDto
    {
        public dynamic Error { set; get; } = null;
        public dynamic Result { set; get; } = null;
        public bool Success { set; get; } = true;
        public string TargetUrl { set; get; } = null;
        public bool UnAuthorizedRequest { set; get; } = false;
        public bool __abp { set; get; } = true;
    }

    public class Audience
    {
        public string Secret { get; set; }
        public string Iss { get; set; }
        public string Aud { get; set; }
        public string Expire { get; set; }
    }

    public class App
    {
        public string Ip { get; set; }
        public double Port { get; set; }
        public string GatewayIp { set; get; }
        public double GatewayPort { set; get; }
    }

    public class AuthenticateModel
    {
        [Required]
        [StringLength(256)]
        public string UserNameOrEmailAddress { get; set; }

        [Required]
        [StringLength(32)]
        public string Password { get; set; }
        [Required]
        public int Healthfacilities { get; set; }
        public bool RememberClient { get; set; }
    }

    public class AuthenticateResultModel
    {
        public string AccessToken { get; set; }
        public string EncryptedAccessToken { get; set; }
        public double ExpireInSeconds { get; set; }
        public int UserId { get; set; }
    }

    public class LanguageDto
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Icon { get; set; }
        public bool IsDefault { get; set; } = false;
        public bool IsDisabled { get; set; } = false;
    }

    public class MenuItem
    {
        public string Name { get; set; }
        public string PermissionName { get; set; }
        public string Icon { get; set; } = "";
        public string Route { get; set; } = "/app/none";
        public List<MenuItem> Items { get; set; } = new List<MenuItem>();
    }
}
