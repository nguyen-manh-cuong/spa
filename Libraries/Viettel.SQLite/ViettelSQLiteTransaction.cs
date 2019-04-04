using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace Viettel.SQLite
{
    public class ViettelSQLiteTransaction : IDbTransaction
    {
        IDbTransaction _transaction;
        ViettelSQLiteConcurrentConnection _conn;
        bool _hasFinished = false;
        public ViettelSQLiteTransaction(IDbTransaction transaction, ViettelSQLiteConcurrentConnection conn)
        {
            this._transaction = transaction;
            this._conn = conn;

            this._conn.RWLock.BeginTransaction();
        }

        ~ViettelSQLiteTransaction()
        {
            this.Dispose();
        }

        public IDbTransaction PersistedTransaction { get { return this._transaction; } }

        void EndTransaction()
        {
            if (this._hasFinished == false)
            {
                this._conn.RWLock.EndTransaction();
                this._hasFinished = true;
            }
        }


        public IDbConnection Connection { get { return this._transaction.Connection; } }
        public IsolationLevel IsolationLevel { get { return this._transaction.IsolationLevel; } }
        public void Commit()
        {
            try
            {
                this._transaction.Commit();
            }
            finally
            {
                this.EndTransaction();
            }
        }
        public void Rollback()
        {
            try
            {
                this._transaction.Rollback();
            }
            finally
            {
                this.EndTransaction();
            }
        }

        public void Dispose()
        {
            this._transaction.Dispose();
            this.EndTransaction();
            GC.SuppressFinalize(this);
        }
    }
}
