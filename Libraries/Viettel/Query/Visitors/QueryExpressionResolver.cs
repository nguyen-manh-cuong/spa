using Viettel.DbExpressions;
using Viettel.Query.QueryExpressions;
using Viettel.Query.QueryState;
using Viettel.Utility;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace Viettel.Query.Visitors
{
    class QueryExpressionResolver : QueryExpressionVisitor<IQueryState>
    {
        ScopeParameterDictionary _scopeParameters;
        KeyDictionary<string> _scopeTables;
        QueryExpressionResolver(ScopeParameterDictionary scopeParameters, KeyDictionary<string> scopeTables)
        {
            this._scopeParameters = scopeParameters;
            this._scopeTables = scopeTables;
        }
        public static IQueryState Resolve(QueryExpression queryExpression, ScopeParameterDictionary scopeParameters, KeyDictionary<string> scopeTables)
        {
            QueryExpressionResolver resolver = new QueryExpressionResolver(scopeParameters, scopeTables);
            return queryExpression.Accept(resolver);
        }

        public override IQueryState Visit(RootQueryExpression exp)
        {
            IQueryState queryState = new RootQueryState(exp.ElementType, exp.ExplicitTable, exp.Lock, this._scopeParameters, this._scopeTables);
            return queryState;
        }
        public override IQueryState Visit(WhereExpression exp)
        {
            IQueryState prevState = exp.PrevExpression.Accept(this);
            IQueryState state = prevState.Accept(exp);
            return state;
        }
        public override IQueryState Visit(OrderExpression exp)
        {
            IQueryState prevState = exp.PrevExpression.Accept(this);
            IQueryState state = prevState.Accept(exp);
            return state;
        }
        public override IQueryState Visit(SelectExpression exp)
        {
            IQueryState prevState = exp.PrevExpression.Accept(this);
            IQueryState state = prevState.Accept(exp);
            return state;
        }
        public override IQueryState Visit(SkipExpression exp)
        {
            IQueryState prevState = exp.PrevExpression.Accept(this);
            IQueryState state = prevState.Accept(exp);
            return state;
        }
        public override IQueryState Visit(TakeExpression exp)
        {
            IQueryState prevState = exp.PrevExpression.Accept(this);
            IQueryState state = prevState.Accept(exp);
            return state;
        }
        public override IQueryState Visit(AggregateQueryExpression exp)
        {
            IQueryState prevState = exp.PrevExpression.Accept(this);
            IQueryState state = prevState.Accept(exp);
            return state;
        }
        public override IQueryState Visit(JoinQueryExpression exp)
        {
            IQueryState qs = QueryExpressionResolver.Resolve(exp.PrevExpression, this._scopeParameters, this._scopeTables);

            ResultElement resultElement = qs.ToFromQueryResult();

            List<IMappingObjectExpression> moeList = new List<IMappingObjectExpression>();
            moeList.Add(resultElement.MappingObjectExpression);

            foreach (JoiningQueryInfo joiningQueryInfo in exp.JoinedQueries)
            {
                ScopeParameterDictionary scopeParameters = resultElement.ScopeParameters.Clone(resultElement.ScopeParameters.Count + moeList.Count);
                for (int i = 0; i < moeList.Count; i++)
                {
                    ParameterExpression p = joiningQueryInfo.Condition.Parameters[i];
                    scopeParameters[p] = moeList[i];
                }

                JoinQueryResult joinQueryResult = JoinQueryExpressionResolver.Resolve(joiningQueryInfo.Query.QueryExpression, resultElement, joiningQueryInfo.JoinType, joiningQueryInfo.Condition, scopeParameters);

                var nullChecking = DbExpression.CaseWhen(new DbCaseWhenExpression.WhenThenExpressionPair(joinQueryResult.JoinTable.Condition, DbConstantExpression.One), DbConstantExpression.Null, DbConstantExpression.One.Type);

                if (joiningQueryInfo.JoinType == JoinType.LeftJoin)
                {
                    joinQueryResult.MappingObjectExpression.SetNullChecking(nullChecking);
                }
                else if (joiningQueryInfo.JoinType == JoinType.RightJoin)
                {
                    foreach (IMappingObjectExpression item in moeList)
                    {
                        item.SetNullChecking(nullChecking);
                    }
                }
                else if (joiningQueryInfo.JoinType == JoinType.FullJoin)
                {
                    joinQueryResult.MappingObjectExpression.SetNullChecking(nullChecking);
                    foreach (IMappingObjectExpression item in moeList)
                    {
                        item.SetNullChecking(nullChecking);
                    }
                }

                resultElement.FromTable.JoinTables.Add(joinQueryResult.JoinTable);
                moeList.Add(joinQueryResult.MappingObjectExpression);
            }

            ScopeParameterDictionary scopeParameters1 = resultElement.ScopeParameters.Clone(resultElement.ScopeParameters.Count + moeList.Count);
            for (int i = 0; i < moeList.Count; i++)
            {
                ParameterExpression p = exp.Selector.Parameters[i];
                scopeParameters1[p] = moeList[i];
            }
            IMappingObjectExpression moe = SelectorResolver.Resolve(exp.Selector, scopeParameters1, resultElement.ScopeTables);
            resultElement.MappingObjectExpression = moe;

            GeneralQueryState queryState = new GeneralQueryState(resultElement);
            return queryState;
        }
        public override IQueryState Visit(GroupingQueryExpression exp)
        {
            IQueryState prevState = exp.PrevExpression.Accept(this);
            IQueryState state = prevState.Accept(exp);
            return state;
        }
        public override IQueryState Visit(DistinctExpression exp)
        {
            IQueryState prevState = exp.PrevExpression.Accept(this);
            IQueryState state = prevState.Accept(exp);
            return state;
        }
    }
}
