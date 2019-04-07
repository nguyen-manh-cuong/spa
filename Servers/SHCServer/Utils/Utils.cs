using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.IdentityModel.Tokens;
using SHCServer.Models;

namespace SHCServer
{
    public class SmsRespone
    {
        public long Code { set; get; }
        public string Message { set; get; }

        public string PhoneNumber { set; get; }
        public int HealthFacilitiesId { set; get; }
        public int SmsTemplateId { set; get; }
        public int SmsPackagesDistributeId { set; get; }
    }

    public class SmsContent
    {
        public SmsBrands SmsBrand { set; get; }
        public string PhoneNumber { set; get; }
        public string Message { set; get; }

        public int HealthFacilitiesId { set; get; }
        public int SmsTemplateId { set; get; }
        public int SmsPackagesDistributeId { set; get; }
    }

    public class Utils
    {
        public static bool PropertyExists<T>(string propertyName)
        {
            return typeof(T).GetProperty(propertyName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance) != null;
        }

        public static Expression<Func<T, string>> GetPropertyExpression<T>(string propertyName)
        {
            if (typeof(T).GetProperty(propertyName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance) == null) return null;

            var paramterExpression = Expression.Parameter(typeof(T));

            return (Expression<Func<T, string>>)Expression.Lambda(Expression.PropertyOrField(paramterExpression, propertyName), paramterExpression);
        }

        public static int GetUidToken(string token, string secret)
        {
            var key = Encoding.ASCII.GetBytes(secret);
            var handler = new JwtSecurityTokenHandler();
            _ = handler.ReadToken(token);
            var validations = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false
            };
            return int.Parse(handler.ValidateToken(token, validations, out _).FindFirstValue("Uid"));
        }

        public static bool IsExpired(string token, string secret)
        {
            try
            {
                return new JwtSecurityToken(token).ValidTo < DateTime.Now;
            }
            catch (Exception)
            {
                return true;
            }
        }

        public static string HashPassword(string password)
        {
            var prf = KeyDerivationPrf.HMACSHA256;
            var rng = RandomNumberGenerator.Create();
            const int iterCount = 10000;
            const int saltSize = 128 / 8;
            const int numBytesRequested = 256 / 8;

            // Produce a version 3 (see comment above) text hash.
            var salt = new byte[saltSize];
            rng.GetBytes(salt);
            var subkey = KeyDerivation.Pbkdf2(password, salt, prf, iterCount, numBytesRequested);

            var outputBytes = new byte[13 + salt.Length + subkey.Length];
            outputBytes[0] = 0x01; // format marker
            WriteNetworkByteOrder(outputBytes, 1, (uint)prf);
            WriteNetworkByteOrder(outputBytes, 5, iterCount);
            WriteNetworkByteOrder(outputBytes, 9, saltSize);
            Buffer.BlockCopy(salt, 0, outputBytes, 13, salt.Length);
            Buffer.BlockCopy(subkey, 0, outputBytes, 13 + saltSize, subkey.Length);
            return Convert.ToBase64String(outputBytes);
        }

        public static bool VerifyHashedPassword(string hashedPassword, string providedPassword)
        {
            byte[] decodedHashedPassword;
            try
            {
                decodedHashedPassword = Convert.FromBase64String(hashedPassword);
            }
            catch (Exception)
            {
                return false;
            }

            // Wrong version
            if (decodedHashedPassword[0] != 0x01)
            {
                return false;
            }

            // Read header information
            var prf = (KeyDerivationPrf)ReadNetworkByteOrder(decodedHashedPassword, 1);
            var iterCount = (int)ReadNetworkByteOrder(decodedHashedPassword, 5);
            var saltLength = (int)ReadNetworkByteOrder(decodedHashedPassword, 9);

            // Read the salt: must be >= 128 bits
            if (saltLength < 128 / 8)
            {
                return false;
            }

            var salt = new byte[saltLength];
            Buffer.BlockCopy(decodedHashedPassword, 13, salt, 0, salt.Length);

            // Read the subkey (the rest of the payload): must be >= 128 bits
            var subkeyLength = decodedHashedPassword.Length - 13 - salt.Length;
            if (subkeyLength < 128 / 8)
            {
                return false;
            }

            var expectedSubkey = new byte[subkeyLength];
            Buffer.BlockCopy(decodedHashedPassword, 13 + salt.Length, expectedSubkey, 0, expectedSubkey.Length);

            // Hash the incoming password and verify it
            var actualSubkey = KeyDerivation.Pbkdf2(providedPassword, salt, prf, iterCount, subkeyLength);
            return actualSubkey.SequenceEqual(expectedSubkey);
        }

        private static void WriteNetworkByteOrder(byte[] buffer, int offset, uint value)
        {
            buffer[offset + 0] = (byte)(value >> 24);
            buffer[offset + 1] = (byte)(value >> 16);
            buffer[offset + 2] = (byte)(value >> 8);
            buffer[offset + 3] = (byte)(value >> 0);
        }

        private static uint ReadNetworkByteOrder(IReadOnlyList<byte> buffer, int offset)
        {
            return ((uint)buffer[offset + 0] << 24)
                 | ((uint)buffer[offset + 1] << 16)
                 | ((uint)buffer[offset + 2] << 8)
                 | buffer[offset + 3];
        }

        public static object ConvertToObjectWithoutPropertiesWithNullValues<T>(T objectToTransform)
        {
            var type = objectToTransform.GetType();
            var returnClass = new ExpandoObject() as IDictionary<string, object>;
            foreach (var propertyInfo in type.GetProperties())
            {
                var value = propertyInfo.GetValue(objectToTransform);
                var valueIsNotAString = !(value is string && !string.IsNullOrWhiteSpace(value.ToString()));
                if (valueIsNotAString && value != null)
                {
                    returnClass.Add(propertyInfo.Name, value);
                }
            }
            return returnClass;
        }

        public static SmsRespone SendSMS(SmsContent content, int type = 1)
        {
            tinnhanthuonghieu.CcApiClient requestMT = new tinnhanthuonghieu.CcApiClient();
             
            string User = content.SmsBrand.UserName;
            string Password = content.SmsBrand.UserName;
            string CPCode = content.SmsBrand.CPCode;
            const string RequestID = "1";
            const string CommandCode = "bulksms";

            string ServiceID = content.SmsBrand.ServiceId;
            string UserID = content.PhoneNumber;
            string ReceiverID = content.PhoneNumber;
            string Content = content.Message;
            string ContentType = "1";

            if (type == 1)
            {
                ContentType = "1";
            }
            else if (type == 0)
            {
                ContentType = "0";
            }

            try
            {
                var response = requestMT.wsCpMtAsync(User, Password, CPCode, RequestID, UserID, ReceiverID, ServiceID, CommandCode, Content, ContentType);
                var result = response.Result.@return;

                return new SmsRespone
                {
                    Code = result.result1,
                    Message = result.message
                };
            }
            finally
            {

            }
        }

        public static List<SmsRespone> SendListSMS(List<SmsContent> lst, int type = 1)
        {
            //long code = 0;
            //int failSms = 0;
            //int total = lst.Count;
            //string message = "";
            List<SmsRespone> lstSmsRespones = new List<SmsRespone>();

            foreach (var smsContent in lst)
            {
                lstSmsRespones.Add(SendSMS(smsContent));

                //var sendMt = SendSMS(smsContent);
                //code = sendMt.Code;

                //if (sendMt.Code == 0)
                //{
                //    failSms++;
                //    message = "<b>Tổng số SMS đã gửi\\Số SMS gửi lỗi: " + total + "\\" + failSms;
                //}
                //else
                //{
                //    message = "<b>Tổng số SMS đã gửi\\Số SMS gửi lỗi: " + total + "\\" + failSms;
                //}
            }

            return lstSmsRespones;
        }

        //public static string GetLocalToken(HttpClient _httpClient, BearerToken _token, string key = null, string host = "127.0.0.1", double port = 9000)
        //{
        //    string tokenUrl = $"http://{host}:{port}/administration/connect/token";
        //    List<KeyValuePair<string, string>> formData = new List<KeyValuePair<string, string>>
        //    {
        //        new KeyValuePair<string, string>("client_id", "admin"),
        //        new KeyValuePair<string, string>("client_secret", key),
        //        new KeyValuePair<string, string>("scope", "admin"),
        //        new KeyValuePair<string, string>("grant_type", "client_credentials")
        //    };
        //    FormUrlEncodedContent content = new FormUrlEncodedContent(formData);
        //    try
        //    {
        //        HttpResponseMessage response = _httpClient.PostAsync(tokenUrl, content).Result;
        //        string responseContent = response.Content.ReadAsStringAsync().Result;
        //        response.EnsureSuccessStatusCode();
        //        _token = JsonConvert.DeserializeObject<BearerToken>(responseContent);
        //        return _token.AccessToken.ToString();
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new Exception(ex.Message);
        //    }
        //}

        //public static FileConfiguration GetRouter(HttpClient _httpClient, HttpResponseMessage _response, BearerToken _token, string key, string host = "127.0.0.1", double port = 9000)
        //{
        //    string configurationUrl = $"http://{host}:{port}/administration/configuration";
        //    try
        //    {
        //        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GetLocalToken(_httpClient, _token, key, host, port));
        //        _response = _httpClient.GetAsync(configurationUrl).Result;
        //        string _responseConfig = _response.Content.ReadAsStringAsync().Result;
        //        return JsonConvert.DeserializeObject<FileConfiguration>(_responseConfig);
        //    }
        //    catch (Exception)
        //    {
        //        return new FileConfiguration();
        //    }
        //}

        //public static ActionResultDTO PostRouter(HttpClient _httpClient, HttpResponseMessage _response, BearerToken _token, string key, string host = "127.0.0.1", double port = 9000, dynamic updatedConfiguration = null)
        //{
        //    try
        //    {
        //        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", GetLocalToken(_httpClient, _token, key, host, port));
        //        dynamic json = JsonConvert.SerializeObject(updatedConfiguration);
        //        StringContent content = new StringContent(json);
        //        content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        //        _response = _httpClient.PostAsync($"http://{host}:{port}/administration/configuration", content).Result;
        //        return new ActionResultDTO() { Success = true };
        //    }
        //    catch (Exception ex)
        //    {
        //        return new ActionResultDTO() { Error = new { code = 0, message = ex.Message } };
        //    }
        //}
    }

    public class TokenResult
    {
        public ClaimsPrincipal Claims { set; get; }
        public SecurityToken Security { set; get; }
    }

    public static class Helper
    {
        public static object GetPropertyValue(this object T, string PropName)
        {
            return T.GetType().GetProperty(PropName) == null ? null : T.GetType().GetProperty(PropName).GetValue(T, null);
        }
    }

    public class FriendlyException
    {
        internal object Throw(string message)
        {
            return new ActionResultDto { Success = false, Error = new { Code = 500, Message = "Đã có lỗi xảy ra", Details = message } };
        }
        internal object Throw(string title, string detail)
        {
            return new ActionResultDto { Success = false, Error = new { Code = 500, Message = title, Details = detail } };
        }
        internal object Throw(int code, string title, string detail)
        {
            return new ActionResultDto { Success = false, Error = new { Code = 401, Message = title, Details = detail } };
        } 
    }
}