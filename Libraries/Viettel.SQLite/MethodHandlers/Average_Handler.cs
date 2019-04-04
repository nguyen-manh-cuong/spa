using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Viettel.DbExpressions;

namespace Viettel.SQLite.MethodHandlers
{
    class Average_Handler : IMethodHandler
    {
        public bool CanProcess(DbMethodCallExpression exp)
        {
            if (exp.Method.DeclaringType != UtilConstants.TypeOfSql)
                return false;

            return true;
        }
        public void Process(DbMethodCallExpression exp, SqlGenerator generator)
        {
            SqlGenerator.Aggregate_Average(generator, exp.Arguments.First(), exp.Method.ReturnType);
        }
    }
}
