using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Viettel.DbExpressions;

namespace Viettel.SQLite.MethodHandlers
{
    class ToLower_Handler : IMethodHandler
    {
        public bool CanProcess(DbMethodCallExpression exp)
        {
            if (exp.Method != UtilConstants.MethodInfo_String_ToLower)
                return false;

            return true;
        }
        public void Process(DbMethodCallExpression exp, SqlGenerator generator)
        {
            generator.SqlBuilder.Append("LOWER(");
            exp.Object.Accept(generator);
            generator.SqlBuilder.Append(")");
        }
    }
}
