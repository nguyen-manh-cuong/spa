using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Viettel.DbExpressions;
using Viettel.InternalExtensions;

namespace Viettel.Oracle.MethodHandlers
{
    class NextValueForSequence_Handler : IMethodHandler
    {
        public bool CanProcess(DbMethodCallExpression exp)
        {
            if (exp.Method.DeclaringType != UtilConstants.TypeOfSql)
                return false;

            return true;
        }
        public void Process(DbMethodCallExpression exp, SqlGenerator generator)
        {
            string sequenceName = (string)exp.Arguments[0].Evaluate();
            if (string.IsNullOrEmpty(sequenceName))
                throw new ArgumentException("The sequence name cannot be empty.");

            generator.QuoteName(sequenceName);
            generator.SqlBuilder.Append(".nextval");
        }
    }
}
