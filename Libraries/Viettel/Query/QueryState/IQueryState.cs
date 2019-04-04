using Viettel.Query.QueryExpressions;
using Viettel.Query.Mapping;
using Viettel.Query.Visitors;
using Viettel.DbExpressions;
using System.Linq.Expressions;
using System.Collections.Generic;
using Viettel.Utility;

namespace Viettel.Query.QueryState
{
    interface IQueryState
    {
        MappingData GenerateMappingData();

        ResultElement ToFromQueryResult();
        JoinQueryResult ToJoinQueryResult(JoinType joinType, LambdaExpression conditionExpression, ScopeParameterDictionary scopeParameters, KeyDictionary<string> scopeTables, string tableAlias);

        IQueryState Accept(WhereExpression exp);
        IQueryState Accept(OrderExpression exp);
        IQueryState Accept(SelectExpression exp);
        IQueryState Accept(SkipExpression exp);
        IQueryState Accept(TakeExpression exp);
        IQueryState Accept(AggregateQueryExpression exp);
        IQueryState Accept(GroupingQueryExpression exp);
        IQueryState Accept(DistinctExpression exp);
    }
}
