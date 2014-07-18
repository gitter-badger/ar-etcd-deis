var Etcd = require('node-etcd');
var Q = require('q');


/**
 * Export function to get host/port of the given application name
 * The module requires that the environment variables ETCD_HOST must be set.
 * @type {Object}
 * @return { getHostInfo() } 
 */
module.exports = {
  
  /**
   * Return the host/port of the deis application
   * @param  {string} appName the deis application
   * @return {object}         {host: string, port: string}
   */
  getHostInfo: function(appName) {
    console.log('Getting host of service: ', appName);
    var deferred = Q.defer();

    if (process.env.ETCD_HOST) {
      console.log('Connecting to etcd...', process.env.ETCD_HOST);
      var etcd = new Etcd(process.env.ETCD_HOST);

      etcd.get('/deis/services/' + appName, function(err, data) {
      
        if (err) {
          console.log('Requesting to etcd failed with error: ', err);
          deferred.reject(err);
        }

        // Parse data from etcd to get redis service host&port
        console.log('data retrieved: ', data);
          
        // The data return may consist of multiple node, corresponding to multiple releases
        // Ex: "172.17.8.100:49153"
        var host = data.node.nodes[0].value;
        host = host.split(':');
        console.log('Host info: ', host[0], '-', host[1]);

        deferred.resolve({
          host: host[0],
          port: host[1]
        });

      });
    } else {
      console.log('ETCD_HOST is not set');
      deferred.reject('ETCD_HOST is not set');
    }

    return deferred.promise;
  }
};
