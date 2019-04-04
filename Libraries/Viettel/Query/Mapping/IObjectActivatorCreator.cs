using Viettel.Mapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text;

namespace Viettel.Query.Mapping
{
    public interface IObjectActivatorCreator
    {
        IObjectActivator CreateObjectActivator();
        IObjectActivator CreateObjectActivator(IDbContext dbContext);
    }
}
