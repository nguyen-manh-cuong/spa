using Viettel.Utility;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace Viettel.MySql
{
    public class ViettelMySqlConnection : IDbConnection, IDisposable
    {
        IDbConnection _dbConnection;
        public ViettelMySqlConnection(IDbConnection dbConnection)
        {
            PublicHelper.CheckNull(dbConnection);
            this._dbConnection = dbConnection;
        }

        public IDbConnection PersistedDbConnection { get { return this._dbConnection; } }

        public string ConnectionString
        {
            get { return this._dbConnection.ConnectionString; }
            set { this._dbConnection.ConnectionString = value; }
        }
        public int ConnectionTimeout
        {
            get { return this._dbConnection.ConnectionTimeout; }
        }
        public string Database
        {
            get { return this._dbConnection.Database; }
        }
        public ConnectionState State
        {
            get { return this._dbConnection.State; }
        }

        public IDbTransaction BeginTransaction()
        {
            return this._dbConnection.BeginTransaction();
        }
        public IDbTransaction BeginTransaction(IsolationLevel il)
        {
            return this._dbConnection.BeginTransaction(il);
        }
        public void ChangeDatabase(string databaseName)
        {
            this._dbConnection.ChangeDatabase(databaseName);
        }
        public void Close()
        {
            this._dbConnection.Close();
        }
        public IDbCommand CreateCommand()
        {
            return new ViettelMySqlCommand(this._dbConnection.CreateCommand());
        }
        public void Open()
        {
            this._dbConnection.Open();
        }

        public void Dispose()
        {
            this._dbConnection.Dispose();
        }
    }
}
