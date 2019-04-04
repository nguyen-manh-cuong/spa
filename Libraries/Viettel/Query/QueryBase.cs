using Viettel.Query.QueryExpressions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Viettel.Query
{
    abstract class QueryBase
    {
        public abstract QueryExpression QueryExpression { get; }
        public abstract bool TrackEntity { get; }
    }

}
