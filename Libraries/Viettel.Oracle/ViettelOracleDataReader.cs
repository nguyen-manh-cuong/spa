using Viettel.Utility;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace Viettel.Oracle
{
    public class ViettelOracleDataReader : IDataReader, IDataRecord, IDisposable
    {
        IDataReader _reader;

        public ViettelOracleDataReader(IDataReader reader)
        {
            PublicHelper.CheckNull(reader);
            this._reader = reader;
        }

        public IDataReader PersistedDataReader { get { return this._reader; } }

        #region IDataReader
        public int Depth { get { return this._reader.Depth; } }
        public bool IsClosed { get { return this._reader.IsClosed; } }
        public int RecordsAffected { get { return this._reader.RecordsAffected; } }

        public void Close()
        {
            this._reader.Close();
        }
        public DataTable GetSchemaTable()
        {
            return this._reader.GetSchemaTable();
        }
        public bool NextResult()
        {
            return this._reader.NextResult();
        }
        public bool Read()
        {
            return this._reader.Read();
        }

        public void Dispose()
        {
            this._reader.Dispose();
        }
        #endregion

        public int FieldCount { get { return this._reader.FieldCount; } }

        public object this[int i] { get { return this._reader[i]; } }
        public object this[string name] { get { return this._reader[name]; } }

        public bool GetBoolean(int i)
        {
            Type fieldType = this._reader.GetFieldType(i);

            if (fieldType == UtilConstants.TypeOfBoolean)
                return this._reader.GetBoolean(i);

            return Convert.ToBoolean(this._reader.GetValue(i));
        }
        public byte GetByte(int i)
        {
            return this._reader.GetByte(i);
        }
        public long GetBytes(int i, long fieldOffset, byte[] buffer, int bufferoffset, int length)
        {
            return this._reader.GetBytes(i, fieldOffset, buffer, bufferoffset, length);
        }
        public char GetChar(int i)
        {
            return this._reader.GetChar(i);
        }
        public long GetChars(int i, long fieldoffset, char[] buffer, int bufferoffset, int length)
        {
            return this._reader.GetChars(i, fieldoffset, buffer, bufferoffset, length);
        }
        public IDataReader GetData(int i)
        {
            return this._reader.GetData(i);
        }
        public string GetDataTypeName(int i)
        {
            return this._reader.GetDataTypeName(i);
        }
        public DateTime GetDateTime(int i)
        {
            return this._reader.GetDateTime(i);
        }
        public decimal GetDecimal(int i)
        {
            return this._reader.GetDecimal(i);
        }
        public double GetDouble(int i)
        {
            return this._reader.GetDouble(i);
        }
        public Type GetFieldType(int i)
        {
            return this._reader.GetFieldType(i);
        }
        public float GetFloat(int i)
        {
            return this._reader.GetFloat(i);
        }
        public Guid GetGuid(int i)
        {
            return this._reader.GetGuid(i);
        }
        public short GetInt16(int i)
        {
            return this._reader.GetInt16(i);
        }
        public int GetInt32(int i)
        {
            return this._reader.GetInt32(i);
        }
        public long GetInt64(int i)
        {
            return this._reader.GetInt64(i);
        }
        public string GetName(int i)
        {
            return this._reader.GetName(i);
        }
        public int GetOrdinal(string name)
        {
            return this._reader.GetOrdinal(name);
        }
        public string GetString(int i)
        {
            return this._reader.GetString(i);
        }
        public object GetValue(int i)
        {
            return this._reader.GetValue(i);
        }
        public int GetValues(object[] values)
        {
            return this._reader.GetValues(values);
        }
        public bool IsDBNull(int i)
        {
            return this._reader.IsDBNull(i);
        }
    }
}