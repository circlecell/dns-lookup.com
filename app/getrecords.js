const dns = require('native-dns');

function getRecords(name, type = 'ANY') {
    return new Promise((resolve, reject) => {
        const req = new dns.Request({
            question: new dns.Question({ name, type }),
            server: { address: '8.8.8.8', port: 53, type: 'udp' },
            timeout: 5000
        });

        req.on('timeout', () => {
            reject(new Error('Timeout in making request'));
        });

        req.on('message', (err, { answer } = {}) => {
            if (err) {
                reject(err);
            } else {
                resolve(answer);
            }
        });

        req.send();
    });
}

module.exports = getRecords;
