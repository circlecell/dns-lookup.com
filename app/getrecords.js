var dns = require('native-dns');

module.exports = getRecords;

function getRecords(name, type = 'ANY') {
    return new Promise((resolve, reject) => {
        var start = Date.now();

        var req = dns.Request({
          question: dns.Question({ name, type }),
          server: { address: '8.8.8.8', port: 53, type: 'udp' },
          timeout: 5000
        });

        req.on('timeout', function () {
            reject(new Error('Timeout in making request'));
        });

        req.on('message', function (err, {answer} = {}) {
            if(err) {
                return reject(err);
            }

            resolve(answer);
        });

        req.send();
    });
}
