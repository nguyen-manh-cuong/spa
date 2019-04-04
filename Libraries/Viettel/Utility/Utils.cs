using Viettel.DbExpressions;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Viettel
{
    static class Utils
    {
        public static void CheckNull(object obj, string paramName = null)
        {
            if (obj == null)
                throw new ArgumentNullException(paramName);
        }

        public static string GenerateUniqueColumnAlias(DbSqlQueryExpression sqlQuery, string defaultAlias = UtilConstants.DefaultColumnAlias)
        {
            string alias = defaultAlias;
            int i = 0;
            while (sqlQuery.ColumnSegments.Any(a => string.Equals(a.Alias, alias, StringComparison.OrdinalIgnoreCase)))
            {
                alias = defaultAlias + i.ToString();
                i++;
            }

            return alias;
        }

        public static List<T> Clone<T>(List<T> source, int? capacity = null)
        {
            List<T> ret = new List<T>(capacity ?? source.Count);
            ret.AddRange(source);
            return ret;
        }
        public static List<T> CloneAndAppendOne<T>(List<T> source, T t)
        {
            List<T> ret = new List<T>(source.Count + 1);
            ret.AddRange(source);
            ret.Add(t);
            return ret;
        }

        public static DbJoinType AsDbJoinType(this JoinType joinType)
        {
            switch (joinType)
            {
                case JoinType.InnerJoin:
                    return DbJoinType.InnerJoin;
                case JoinType.LeftJoin:
                    return DbJoinType.LeftJoin;
                case JoinType.RightJoin:
                    return DbJoinType.RightJoin;
                case JoinType.FullJoin:
                    return DbJoinType.FullJoin;
                default:
                    throw new NotSupportedException();
            }
        }

        public static Type GetFuncDelegateType(Type[] typeArguments)
        {
            int parameters = typeArguments.Length;
            Type funcType = null;
            switch (parameters)
            {
                case 3:
                    funcType = typeof(Func<,,>);
                    break;
                case 4:
                    funcType = typeof(Func<,,,>);
                    break;
                case 5:
                    funcType = typeof(Func<,,,,>);
                    break;
                case 6:
                    funcType = typeof(Func<,,,,,>);
                    break;
                default:
                    throw new NotSupportedException();
            }

            return funcType.MakeGenericType(typeArguments);
        }
        public static bool IsAutoIncrementType(Type t)
        {
            return t == typeof(Int16) || t == typeof(Int32) || t == typeof(Int64);
        }
    }
}
