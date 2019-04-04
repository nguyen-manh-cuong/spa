using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Viettel.DbExpressions;

namespace Viettel.MySql.MethodHandlers
{
    class DiffDays_Handler : IMethodHandler
    {
        public bool CanProcess(DbMethodCallExpression exp)
        {
            if (exp.Method.DeclaringType != UtilConstants.TypeOfSql)
                return false;

            return true;
        }
        public void Process(DbMethodCallExpression exp, SqlGenerator generator)
        {
            SqlGenerator.DbFunction_DATEDIFF(generator, "DAY", exp.Arguments[0], exp.Arguments[1]);
        }
    }
}
