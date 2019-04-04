﻿using Ocelot.Logging;
using Ocelot.ServiceDiscovery.Providers;
using Ocelot.Values;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Ocelot.Provider.Kubernetes
{
    public class PollKube : IServiceDiscoveryProvider
    {
        private readonly IOcelotLogger _logger;
        private readonly IServiceDiscoveryProvider _kubeServiceDiscoveryProvider;
        private readonly Timer _timer;
        private bool _polling;
        private List<Service> _services;

        public PollKube(int pollingInterval, IOcelotLoggerFactory factory, IServiceDiscoveryProvider kubeServiceDiscoveryProvider)
        {
            _logger = factory.CreateLogger<PollKube>();
            _kubeServiceDiscoveryProvider = kubeServiceDiscoveryProvider;
            _services = new List<Service>();

            _timer = new Timer(async x =>
            {
                if (_polling)
                {
                    return;
                }

                _polling = true;
                await Poll();
                _polling = false;
            }, null, pollingInterval, pollingInterval);
        }

        public Task<List<Service>> Get()
        {
            return Task.FromResult(_services);
        }

        private async Task Poll()
        {
            _services = await _kubeServiceDiscoveryProvider.Get();
        }
    }
}
 
