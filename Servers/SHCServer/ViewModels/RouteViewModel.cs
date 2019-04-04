using System.Collections.Generic;
using SHCServer.Models;
using Viettel;
using Viettel.MySql;

namespace SHCServer.ViewModels
{
    public class RouteViewModel
    {
        protected DbContext _context;

        public RouteViewModel()
        {
        }

        public RouteViewModel(Router obj, string connectionString) : this()
        {
            _context = new MySqlContext(new MySqlConnectionFactory(connectionString));

            Id  = obj.Id;
            Url = obj.DownstreamPathTemplate;

            Groups = _context.JoinQuery<RouterGroup, Group>((rg, g) => new object[] { JoinType.LeftJoin, rg.GroupId == g.Id })
                             .Where((u, g) => u.RouterId == obj.Id)
                             .Select((u, g) => new GroupViewModel(g)).ToList();
        }

        public int Id { set; get; }
        public string Url { get; set; }

        public List<GroupViewModel> Groups { get; set; }
    }
}