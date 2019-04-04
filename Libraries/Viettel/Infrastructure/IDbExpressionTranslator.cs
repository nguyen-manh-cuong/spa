using Viettel.DbExpressions;
using System.Collections.Generic;

namespace Viettel.Infrastructure
{
    public interface IDbExpressionTranslator
    {
        string Translate(DbExpression expression, out List<DbParam> parameters);
    }
}
