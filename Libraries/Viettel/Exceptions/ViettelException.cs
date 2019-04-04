using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Viettel.Exceptions
{
    public class ViettelException : Exception
    {
        public ViettelException()
            : this("An exception occurred in the persistence layer.")
        {
        }

        public ViettelException(string message)
            : base(message)
        {
        }

        public ViettelException(Exception innerException)
            : base(innerException.Message, innerException)
        {
        }

        public ViettelException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}
