using Viettel.Core;
using Viettel.Core.Visitors;
using Viettel.DbExpressions;
using Viettel.Descriptors;
using Viettel.Entity;
using Viettel.Exceptions;
using Viettel.Infrastructure;
using Viettel.InternalExtensions;
using Viettel.Utility;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;

namespace Viettel.PostgreSQL
{
    public partial class PostgreSQLContext : DbContext
    {
        static Action<TEntity, IDataReader> GetMapper<TEntity>(PropertyDescriptor propertyDescriptor, int ordinal)
        {
            Action<TEntity, IDataReader> mapper = (TEntity entity, IDataReader reader) =>
            {
                object value = reader.GetValue(ordinal);
                if (value == null || value == DBNull.Value)
                    throw new ViettelException("Unable to get the identity/sequence value.");

                value = PublicHelper.ConvertObjType(value, propertyDescriptor.PropertyType);
                propertyDescriptor.SetValue(entity, value);
            };

            return mapper;
        }
        static Dictionary<PropertyDescriptor, object> CreateKeyValueMap(TypeDescriptor typeDescriptor)
        {
            Dictionary<PropertyDescriptor, object> keyValueMap = new Dictionary<PropertyDescriptor, object>(typeDescriptor.PrimaryKeys.Count);
            foreach (PropertyDescriptor keyPropertyDescriptor in typeDescriptor.PrimaryKeys)
            {
                keyValueMap.Add(keyPropertyDescriptor, null);
            }

            return keyValueMap;
        }

        string AppendInsertRangeSqlTemplate(DbTable table, List<PropertyDescriptor> mappingPropertyDescriptors)
        {
            StringBuilder sqlBuilder = new StringBuilder();

            sqlBuilder.Append("INSERT INTO ");
            sqlBuilder.Append(this.AppendTableName(table));
            sqlBuilder.Append("(");

            for (int i = 0; i < mappingPropertyDescriptors.Count; i++)
            {
                PropertyDescriptor mappingPropertyDescriptor = mappingPropertyDescriptors[i];
                if (i > 0)
                    sqlBuilder.Append(",");
                sqlBuilder.Append(Utils.QuoteName(mappingPropertyDescriptor.Column.Name, this.ConvertToLowercase));
            }

            sqlBuilder.Append(") VALUES");

            string sqlTemplate = sqlBuilder.ToString();
            return sqlTemplate;
        }
        string AppendTableName(DbTable table)
        {
            if (string.IsNullOrEmpty(table.Schema))
                return Utils.QuoteName(table.Name, this.ConvertToLowercase);

            return string.Format("{0}.{1}", Utils.QuoteName(table.Schema, this.ConvertToLowercase), Utils.QuoteName(table.Name, this.ConvertToLowercase));
        }
    }
}