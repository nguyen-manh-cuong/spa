using Viettel.DbExpressions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Viettel.Query.Mapping
{
    public class MappingData
    {
        public MappingData()
        {
        }
        public IObjectActivatorCreator ObjectActivatorCreator { get; set; }
        public DbSqlQueryExpression SqlQuery { get; set; }
    }
}
