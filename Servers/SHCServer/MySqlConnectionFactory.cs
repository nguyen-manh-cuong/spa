using System;
using System.Data;
using System.Diagnostics;
using System.Text;
using MySql.Data.MySqlClient;
using Viettel;
using Viettel.Infrastructure;
using Viettel.Infrastructure.Interception;
using Viettel.MySql;

namespace SHCServer
{
    public class MySqlConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connString;

        public MySqlConnectionFactory(string connString)
        {
            _connString = connString;
        }

        public IDbConnection CreateConnection()
        {
            return new ViettelMySqlConnection(new MySqlConnection(_connString));
        }
    }

    internal class DbCommandInterceptor : IDbCommandInterceptor
    {
        public void ReaderExecuting(IDbCommand command, DbCommandInterceptionContext<IDataReader> interceptionContext)
        {
            //interceptionContext.DataBag.Add("startTime", DateTime.Now);
            Debug.WriteLine(AppendDbCommandInfo(command));
            Console.WriteLine(command.CommandText);
        }

        public void ReaderExecuted(IDbCommand command, DbCommandInterceptionContext<IDataReader> interceptionContext)
        {
            //DateTime startTime = (DateTime)(interceptionContext.DataBag["startTime"]);
            //Console.WriteLine(DateTime.Now.Subtract(startTime).TotalMilliseconds);
            if (interceptionContext.Exception == null)
                Console.WriteLine(interceptionContext.Result.FieldCount);
        }

        public void NonQueryExecuting(IDbCommand command, DbCommandInterceptionContext<int> interceptionContext)
        {
            Debug.WriteLine(AppendDbCommandInfo(command));
            Console.WriteLine(command.CommandText);
        }

        public void NonQueryExecuted(IDbCommand command, DbCommandInterceptionContext<int> interceptionContext)
        {
            if (interceptionContext.Exception == null)
                Console.WriteLine(interceptionContext.Result);
        }

        public void ScalarExecuting(IDbCommand command, DbCommandInterceptionContext<object> interceptionContext)
        {
            //interceptionContext.DataBag.Add("startTime", DateTime.Now);
            Debug.WriteLine(AppendDbCommandInfo(command));
            Console.WriteLine(command.CommandText);
        }

        public void ScalarExecuted(IDbCommand command, DbCommandInterceptionContext<object> interceptionContext)
        {
            //DateTime startTime = (DateTime)(interceptionContext.DataBag["startTime"]);
            //Console.WriteLine(DateTime.Now.Subtract(startTime).TotalMilliseconds);
            if (interceptionContext.Exception == null)
                Console.WriteLine(interceptionContext.Result);
        }

        public static string AppendDbCommandInfo(IDbCommand command)
        {
            var sb = new StringBuilder();

            foreach (IDbDataParameter param in command.Parameters)
            {
                if (param == null)
                    continue;

                object value = null;
                if (param.Value == null || param.Value == DBNull.Value)
                {
                    value = "NULL";
                }
                else
                {
                    value = param.Value;

                    if (param.DbType == DbType.String || param.DbType == DbType.AnsiString || param.DbType == DbType.DateTime)
                        value = "'" + value + "'";
                }

                sb.AppendFormat("{3} {0} {1} = {2};", Enum.GetName(typeof(DbType), param.DbType), param.ParameterName, value, Enum.GetName(typeof(ParameterDirection), param.Direction));
                sb.AppendLine();
            }

            sb.AppendLine(command.CommandText);

            return sb.ToString();
        }
    }

    public class MappingType<T> : MappingTypeBase
    {
        public MappingType()
        {
            Type = typeof(T);
        }

        public MappingType(DbType dbType)
        {
            DbType = dbType;
            Type = typeof(T);
        }

        public override Type Type { get; }

        public override DbType DbType { get; }

        public override IDbDataParameter CreateDataParameter(IDbCommand cmd, DbParam param)
        {
            return base.CreateDataParameter(cmd, param);
        }

        public override object ReadFromDataReader(IDataReader reader, int ordinal)
        {
            var value = reader.GetValue(ordinal);

            if (value is DBNull)
                return null;

            //数据库字段类型与属性类型不一致，则转换类型
            if (value.GetType() != Type)
            {
                value = Convert.ChangeType(value, Type);
            }

            return value;
        }
    }

    internal class StringMappingType : MappingType<string>, IMappingType
    {
        public StringMappingType() : base(DbType.String)
        {
        }

        public override IDbDataParameter CreateDataParameter(IDbCommand cmd, DbParam param)
        {
            var parameter = cmd.CreateParameter();
            parameter.ParameterName = param.Name;

            if (param.Value == null || param.Value == DBNull.Value)
            {
                parameter.Value = DBNull.Value;
            }
            else
            {
                parameter.Value = param.Value;
            }

            if (param.Precision != null)
                parameter.Precision = param.Precision.Value;

            if (param.Scale != null)
                parameter.Scale = param.Scale.Value;

            if (param.Size != null)
                parameter.Size = param.Size.Value;

            const int defaultSizeOfStringOutputParameter = 4000;
            if (param.Direction == ParamDirection.Input)
            {
                parameter.Direction = ParameterDirection.Input;
            }
            else if (param.Direction == ParamDirection.Output)
            {
                parameter.Direction = ParameterDirection.Output;
                param.Value = null;
                if (param.Size == null && param.Type == typeof(string))
                {
                    parameter.Size = defaultSizeOfStringOutputParameter;
                }
            }
            else if (param.Direction == ParamDirection.InputOutput)
            {
                parameter.Direction = ParameterDirection.InputOutput;
                if (param.Size == null && param.Type == typeof(string))
                {
                    parameter.Size = defaultSizeOfStringOutputParameter;
                }
            }
            else
                throw new NotSupportedException($"ParamDirection '{param.Direction}' is not supported.");

            return parameter;
        }
    }
}