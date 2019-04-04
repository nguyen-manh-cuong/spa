using Viettel.DbExpressions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Viettel.MySql
{
    class MySqlSqlGenerator : SqlGenerator
    {
        public static new SqlGenerator CreateInstance()
        {
            return new MySqlSqlGenerator();
        }

        public override DbExpression Visit(DbUpdateExpression exp)
        {
            base.Visit(exp);
            if (exp is MySqlDbUpdateExpression)
            {
                this.SqlBuilder.Append(" LIMIT ", (exp as MySqlDbUpdateExpression).Limits.ToString());
            }

            return exp;
        }
        public override DbExpression Visit(DbDeleteExpression exp)
        {
            base.Visit(exp);
            if (exp is MySqlDbDeleteExpression)
            {
                this.SqlBuilder.Append(" LIMIT ", (exp as MySqlDbDeleteExpression).Limits.ToString());
            }

            return exp;
        }
    }
}
