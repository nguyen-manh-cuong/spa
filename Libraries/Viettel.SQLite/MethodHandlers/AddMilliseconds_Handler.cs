using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Viettel.DbExpressions;

namespace Viettel.SQLite.MethodHandlers
{
    class AddMilliseconds_Handler : IMethodHandler
    {
        public bool CanProcess(DbMethodCallExpression exp)
        {
            if (exp.Method.DeclaringType != UtilConstants.TypeOfDateTime)
                return false;

            return true;
        }
        public void Process(DbMethodCallExpression exp, SqlGenerator generator)
        {
            SqlGenerator.DbFunction_DATEADD(generator, "MILLISECOND", exp);
        }
    }
}
