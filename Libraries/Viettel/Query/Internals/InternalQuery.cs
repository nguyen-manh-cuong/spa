using Viettel.Core;
using Viettel.Core.Visitors;
using Viettel.Infrastructure;
using Viettel.Mapper;
using Viettel.Query.Mapping;
using Viettel.Query.QueryState;
using Viettel.Query.Visitors;
using Viettel.Utility;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;

namespace Viettel.Query.Internals
{
    class InternalQuery<T> : IEnumerable<T>, IEnumerable
    {
        Query<T> _query;

        internal InternalQuery(Query<T> query)
        {
            this._query = query;
        }

        DbCommandFactor GenerateCommandFactor()
        {
            IQueryState qs = QueryExpressionResolver.Resolve(this._query.QueryExpression, new ScopeParameterDictionary(), new KeyDictionary<string>());
            MappingData data = qs.GenerateMappingData();

            IObjectActivator objectActivator;
            if (this._query._trackEntity)
                objectActivator = data.ObjectActivatorCreator.CreateObjectActivator(this._query.DbContext);
            else
                objectActivator = data.ObjectActivatorCreator.CreateObjectActivator();

            IDbExpressionTranslator translator = this._query.DbContext.DatabaseProvider.CreateDbExpressionTranslator();
            List<DbParam> parameters;
            string cmdText = translator.Translate(data.SqlQuery, out parameters);

            DbCommandFactor commandFactor = new DbCommandFactor(objectActivator, cmdText, parameters.ToArray());
            return commandFactor;
        }

        public IEnumerator<T> GetEnumerator()
        {
            DbCommandFactor commandFactor = this.GenerateCommandFactor();
            var enumerator = QueryEnumeratorCreator.CreateEnumerator<T>(this._query.DbContext.AdoSession, commandFactor);
            return enumerator;
        }
        IEnumerator IEnumerable.GetEnumerator()
        {
            return this.GetEnumerator();
        }

        public override string ToString()
        {
            DbCommandFactor commandFactor = this.GenerateCommandFactor();
            return InternalAdoSession.AppendDbCommandInfo(commandFactor.CommandText, commandFactor.Parameters);
        }
    }
}
