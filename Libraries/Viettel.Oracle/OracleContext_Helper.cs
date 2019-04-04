using Viettel.Annotations;
using Viettel.Core;
using Viettel.Core.Visitors;
using Viettel.DbExpressions;
using Viettel.Descriptors;
using Viettel.Entity;
using Viettel.Exceptions;
using Viettel.Infrastructure;
using Viettel.InternalExtensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;

namespace Viettel.Oracle
{
    public partial class OracleContext : DbContext
    {
        static Dictionary<PropertyDescriptor, object> CreateKeyValueMap(TypeDescriptor typeDescriptor)
        {
            Dictionary<PropertyDescriptor, object> keyValueMap = new Dictionary<PropertyDescriptor, object>(typeDescriptor.PrimaryKeys.Count);
            foreach (PropertyDescriptor keyPropertyDescriptor in typeDescriptor.PrimaryKeys)
            {
                keyValueMap.Add(keyPropertyDescriptor, null);
            }

            return keyValueMap;
        }
        static DbExpression MakeCondition(Dictionary<PropertyDescriptor, object> keyValueMap, DbTable dbTable)
        {
            DbExpression conditionExp = null;
            foreach (var kv in keyValueMap)
            {
                PropertyDescriptor keyPropertyDescriptor = kv.Key;
                object keyVal = kv.Value;

                if (keyVal == null)
                    throw new ArgumentException(string.Format("The primary key '{0}' could not be null.", keyPropertyDescriptor.Property.Name));

                DbExpression left = new DbColumnAccessExpression(dbTable, keyPropertyDescriptor.Column);
                DbExpression right = DbExpression.Parameter(keyVal, keyPropertyDescriptor.PropertyType, keyPropertyDescriptor.Column.DbType);
                DbExpression equalExp = new DbEqualExpression(left, right);
                conditionExp = conditionExp == null ? equalExp : DbExpression.And(conditionExp, equalExp);
            }

            return conditionExp;
        }

    }
}
