using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Viettel.Annotations
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public class NonAutoIncrementAttribute : Attribute
    {
    }
}
