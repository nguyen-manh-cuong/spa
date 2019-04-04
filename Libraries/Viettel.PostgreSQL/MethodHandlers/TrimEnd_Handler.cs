using Viettel.InternalExtensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Viettel.DbExpressions;

namespace Viettel.PostgreSQL.MethodHandlers
{
    class TrimEnd_Handler : IMethodHandler
    {
        public bool CanProcess(DbMethodCallExpression exp)
        {
            if (exp.Method != UtilConstants.MethodInfo_String_TrimEnd)
                return false;

            return true;
        }
        public void Process(DbMethodCallExpression exp, SqlGenerator generator)
        {
            MethodHandlerHelper.EnsureTrimCharArgumentIsSpaces(exp.Arguments[0]);

            generator.SqlBuilder.Append("RTRIM(");
            exp.Object.Accept(generator);
            generator.SqlBuilder.Append(")");
        }
    }
}
