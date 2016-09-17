// findOne can be used
// everything returns proxy, use them

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Domain = require('./models/domain');
const getRecords = require('./getrecords');
const wrap = require('co-express');
const equalRecords = require('./equalrecords');

mongoose.connect('mongodb://localhost/dnslookup');

app.set('view engine', 'ejs');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.get('/:domain/:id', wrap(function *(req, res, next) {
    const { domain, id } = req.params;
    const skip = +id - 1;

    if(skip >= 0) {
        let doc;
        try {
            doc = yield Domain.findOne({ name: domain })
                .sort({_id: 1})
                .skip(skip)
                .limit(1);
                
        } catch(e) {
            req.error = e.message;
            next();
        }

        if(!doc) {
            res.redirect(`/${domain}`);
        } else {
            req.data = doc;
            next();
        }
    } else {
        req.error = 'index is wrong';
        return next();
    }
}));

app.get('/:domain', wrap(function *(req, res, next) {
    const { domain } = req.params;

    if(domain === 'favicon.ico') return;

    let doc;
    try {
        doc = yield Domain.findOne({ name: domain })
            .sort({_id: -1})
            .skip(0)
            .limit(1);
    } catch(e) {
        req.error = err.message;
        return next();
    }

    const records = yield getRecords(domain);

    records.forEach(item => {
        delete item.ttl;
        delete item.class;
        //item.foo = Math.random()
    });


    if(!doc || !equalRecords(doc.records, records)) {
        const domainDocument = new Domain({
            name: domain,
            timestamp: Date.now(),
            records
        });

        try {
            const savedDoc = yield domainDocument.save();
            req.data = savedDoc;
        } catch(e) {
            req.error = e.message;
        }

        return next();
    } else {
        req.data = doc;
        return next();
    }
}));


app.get('/:domain/:id?', (req, res) => {
    const { data, error }  = req;
    //data && console.log(`data: ${data}`);
    //error && console.log(`error: ${error}`);
    res.json({ data, error })
});

app.get('/', function(req, res) {
    res.render('index.ejs');
});


app.listen(8080);
console.log('8080 is the magic port');
