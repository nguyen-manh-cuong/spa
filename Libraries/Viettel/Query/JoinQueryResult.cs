using Viettel.DbExpressions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Viettel.Query
{
    public class JoinQueryResult
    {
        public IMappingObjectExpression MappingObjectExpression { get; set; }
        public DbJoinTableExpression JoinTable { get; set; }
    }
}
