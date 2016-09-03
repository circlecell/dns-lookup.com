var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8085;

app.use(express.static('public'));


var router = express.Router();

router.post('/lookup', function(req, res) {
    getRecords(req.body.hostName)
        .then(data => res.json({ data }))
        .catch(error => res.json({ error }));
});



app.use('/api', router);

app.listen(port);

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

              resolve(answer.map(item => {
                  item.typeStr = types[item.type];
                  return item;
              }));
        });

        req.send();
    });

}
