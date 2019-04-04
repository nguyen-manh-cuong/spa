using Viettel.Core.Visitors;
using Viettel.DbExpressions;
using Viettel.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;

namespace Viettel.Query.Visitors
{
    class FilterPredicateParser : ExpressionVisitor<DbExpression>
    {
        public static DbExpression Parse(LambdaExpression filterPredicate, ScopeParameterDictionary scopeParameters, KeyDictionary<string> scopeTables)
        {
            return GeneralExpressionParser.Parse(ExpressionVisitorBase.ReBuildFilterPredicate(filterPredicate), scopeParameters, scopeTables);
        }
    }
}
