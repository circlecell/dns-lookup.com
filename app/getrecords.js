var dns = require('native-dns');
const types = {
    1: 'A',
    2: 'NS',
    5: 'CNAME',
    6: 'SOA',
    28: 'AAAA',
    15: 'MX',
    16: 'TXT',
    33: 'SRV',
    35: 'NAPTR'
}

module.exports = getRecords;

function getRecords(name, type = 'ANY') {
    return new Promise((resolve, reject) => {
        var start = Date.now();

        var req = dns.Request({
          question: dns.Question({ name, type }),
          server: { address: '8.8.8.8', port: 53, type: 'udp' },
          timeout: 22000
        });

        req.on('timeout', function () {
          reject('Timeout in making request');
        });

        req.on('message', function (err, {answer} = {}) {
            if(err) {
                return reject(err);
            }

            resolve(answer.filter(item => {
                //const typeStr = types[item.type];
                //item.typeStr = typeStr;
                return !!types[item.type];
            }));
        });

        req.send();
    });
}
