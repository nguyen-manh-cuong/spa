using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace Viettel.Mapper
{
    public interface IValueSetter
    {
        void SetValue(object obj, IDataReader reader);
    }
}
