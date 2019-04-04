using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace Viettel.Mapper
{
    public interface IObjectActivator
    {
        object CreateInstance(IDataReader reader);
    }
}
