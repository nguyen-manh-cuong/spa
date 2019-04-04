using Viettel.Query.QueryState;
using Viettel.Query.Visitors;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Viettel.Query.QueryExpressions
{
    class RootQueryExpression : QueryExpression
    {
        public RootQueryExpression(Type elementType, string explicitTable, LockType @lock)
            : base(QueryExpressionType.Root, elementType, null)
        {
            this.ExplicitTable = explicitTable;
            this.Lock = @lock;
        }
        public string ExplicitTable { get; private set; }
        public LockType Lock { get; private set; }
        public override T Accept<T>(QueryExpressionVisitor<T> visitor)
        {
            return visitor.Visit(this);
        }
    }
}
