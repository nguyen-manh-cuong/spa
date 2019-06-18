namespace SHCServer.ViewModels
{
    public class ResetPasswordViewModel
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
        public string SecretCode { get; set; }
        public string NewPassword { get; set; }
    }
}