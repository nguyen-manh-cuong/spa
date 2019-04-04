using System.Data;

namespace Viettel.Infrastructure
{
    public interface IDatabaseProvider
    {
        string DatabaseType { get; }
        IDbConnection CreateConnection();
        IDbExpressionTranslator CreateDbExpressionTranslator();
        string CreateParameterName(string name);
    }
}
