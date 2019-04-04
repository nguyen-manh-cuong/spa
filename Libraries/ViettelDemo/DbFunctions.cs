using Viettel.Annotations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ViettelDemo
{
    public class DbFunctions
    {
        [Viettel.Annotations.DbFunctionAttribute()]
        public static string MyFunction(int value)
        {
            throw new NotImplementedException();
        }
    }
}
