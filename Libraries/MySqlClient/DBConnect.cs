using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Reflection;

namespace ViettelSqlClient
{
    public class DBConnect
    {
        public readonly MySqlConnection connection;

        //Constructor
        public DBConnect(string connectionString)
        {
            connection = new MySqlConnection(connectionString);
        }

        //open connection to database
        internal bool OpenConnection()
        {
            try
            {
                if (connection.State == System.Data.ConnectionState.Closed)
                {
                    connection.Open();
                }

                return true;
            }
            catch (MySqlException ex)
            {
                //When handling errors, you can your application's response based 
                //on the error number.
                //The two most common error numbers when connecting are as follows:
                //0: Cannot connect to server.
                //1045: Invalid user name and/or password.
                switch (ex.Number)
                {
                    case 0:
                        throw new System.InvalidOperationException("Cannot connect to server.  Contact administrator");

                    case 1045:
                        throw new System.InvalidOperationException("Invalid username/password, please try again");
                }
                return false;
            }
        }

        //Close connection
        internal bool CloseConnection()
        {
            try
            {
                connection.Close();
                return true;
            }
            catch (MySqlException ex)
            {
                throw new InvalidOperationException(ex.Message);
            }
        }

        public void ExecuteNonQuery(string query)
        {
            //open connection
            if (OpenConnection() == true)
            {
                //create command and assign the query and connection from the constructor
                MySqlCommand cmd = new MySqlCommand(query, connection);

                //Execute command
                cmd.ExecuteNonQuery();

                //close connection
                CloseConnection();
            }
        }

        public void ExecuteNonQuery(string query, List<MySqlParameter> parameters)
        {
            //open connection
            if (OpenConnection() == true)
            {
                MySqlCommand cmd = new MySqlCommand
                {
                    Connection = connection,
                    CommandText = query
                };

                cmd.Prepare();
                cmd.Parameters.AddRange(parameters.ToArray());

                //Execute command
                cmd.ExecuteNonQuery();

                //close connection
                CloseConnection();
            }
        }

        public List<T> Select<T>(string query)
        {
            List<T> list = new List<T>();
            T obj = default(T);
            //Open connection
            if (OpenConnection() == true)
            {
                //Create Command
                MySqlCommand cmd = new MySqlCommand(query, connection);
                //Create a data reader and Execute the command
                MySqlDataReader dataReader = cmd.ExecuteReader();
                //Read the data and store them in the list
                while (dataReader.Read())
                {
                    obj = Activator.CreateInstance<T>();
                    foreach (PropertyInfo prop in obj.GetType().GetProperties())
                    {
                        try
                        {
                            if (!object.Equals(dataReader[prop.Name], DBNull.Value))
                            {
                                prop.SetValue(obj, dataReader[prop.Name], null);
                            }
                        }
                        catch (Exception) { }
                    }
                    list.Add(obj);
                }

                //close Data Reader
                dataReader.Close();

                //close Connection
                CloseConnection();

                //return list to be displayed
                return list;
            }
            else
            {
                return list;
            }
        }

        public List<T> Select<T>(string query, List<MySqlParameter> parameters)
        {
            List<T> list = new List<T>();
            T obj = default(T);
            //Open connection
            if (OpenConnection() == true)
            {
                MySqlCommand command = new MySqlCommand
                {
                    Connection = connection,
                    CommandText = query
                };

                command.Prepare();
                command.Parameters.AddRange(parameters.ToArray());

                //Create a data reader and Execute the command
                MySqlDataReader dataReader = command.ExecuteReader();
                //Read the data and store them in the list
                while (dataReader.Read())
                {
                    obj = Activator.CreateInstance<T>();
                    foreach (PropertyInfo prop in obj.GetType().GetProperties())
                    {
                        try
                        {
                            if (!object.Equals(dataReader[prop.Name], DBNull.Value))
                            {
                                prop.SetValue(obj, dataReader[prop.Name], null);
                            }
                        }
                        catch (Exception) { }
                    }
                    list.Add(obj);
                }

                //close Data Reader
                dataReader.Close();

                //close Connection
                CloseConnection();

                //return list to be displayed
                return list;
            }
            else
            {
                return list;
            }
        }
        //Count statement
        public int Count(string query)
        {
            int Count = -1;

            //Open Connection
            if (OpenConnection() == true)
            {
                //Create Mysql Command
                MySqlCommand cmd = new MySqlCommand(query, connection);

                //ExecuteScalar will return one value
                Count = int.Parse(cmd.ExecuteScalar() + "");

                //close Connection
                CloseConnection();

                return Count;
            }
            else
            {
                return Count;
            }
        }

        public int Count(string query, List<MySqlParameter> parameters)
        {
            int Count = -1;

            //Open Connection
            if (OpenConnection() == true)
            {
                //Create Mysql Command
                MySqlCommand cmd = new MySqlCommand
                {
                    Connection = connection,
                    CommandText = query
                };

                cmd.Prepare();
                cmd.Parameters.AddRange(parameters.ToArray());

                //ExecuteScalar will return one value
                Count = int.Parse(cmd.ExecuteScalar() + "");

                //close Connection
                CloseConnection();

                return Count;
            }
            else
            {
                return Count;
            }
        }

        /// <summary>
        /// map properties
        /// </summary>
        /// <param name="sourceObj"></param>
        /// <param name="targetObj"></param>
        internal void MapProp(object sourceObj, object targetObj)
        {
            Type T1 = sourceObj.GetType();
            Type T2 = targetObj.GetType();

            PropertyInfo[] sourceProprties = T1.GetProperties(BindingFlags.Instance | BindingFlags.Public);
            PropertyInfo[] targetProprties = T2.GetProperties(BindingFlags.Instance | BindingFlags.Public);

            foreach (PropertyInfo sourceProp in sourceProprties)
            {
                object osourceVal = sourceProp.GetValue(sourceObj, null);
                int entIndex = Array.IndexOf(targetProprties, sourceProp);
                if (entIndex >= 0)
                {
                    PropertyInfo targetProp = targetProprties[entIndex];
                    targetProp.SetValue(targetObj, osourceVal);
                }
            }
        }

        public string InsertStr(string table)
        {
            return string.Format("INSERT INTO {0}.{1} ", connection.Database, table);
        }

        public string InsertStr(string table, string[] fields)
        {
            List<string> lstFields = new List<string>();

            foreach (string field in fields)
            {
                lstFields.Add(string.Format("@{0}", field));
            }

            return string.Format("INSERT INTO {0}.{1} ({2}) VALUES ({3})", connection.Database, table, string.Join(",", fields), string.Join(",", lstFields));
        }

        public string UpdateStr(string table)
        {
            return string.Format("Update {0}.{1} SET ", connection.Database, table);
        }

        public string DeleteStr(string table)
        {
            return string.Format("DELETE FROM {0}.{1} WHERE ", connection.Database, table);
        }

        public string DeleteStr(string table, string condition)
        {
            return string.Format("DELETE FROM {0}.{1} WHERE {2}", connection.Database, table, condition);
        }

        public string DeleteStr(string table, string[] condition)
        {
            return string.Format("DELETE FROM {0}.{1} WHERE {2}", connection.Database, table, string.Join(",", condition));
        }

        public string SelectStr(string table, string field)
        {
            return string.Format("SELECT {2} FROM {0}.{1} ", connection.Database, table, field);
        }

        public string SelectStr(string table, string[] fields)
        {
            return string.Format("SELECT {2} FROM {0}.{1} ", connection.Database, table, string.Join(", ", fields));
        }

        public string SelectStr(string table, string field, string condition)
        {
            return string.Format("SELECT {2} FROM {0}.{1} WHERE {3}", connection.Database, table, field, condition);
        }

        public string SelectStr(string table, string[] fields, string condition)
        {
            return string.Format("SELECT {2} FROM {0}.{1} WHERE {3}", connection.Database, table, string.Join(", ", fields), condition);
        }
    }
}