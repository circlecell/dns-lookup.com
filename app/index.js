/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const { groupBy } = require('lodash');
const Domain = require('./models/domain');
const getRecords = require('./getrecords');
const equalRecords = require('./equalrecords');
const types = require('./types');
const recordsInfo = require('./recordsInfo');

const app = express();

mongoose.connect('mongodb://localhost/dnslookup');

app.use(express.static('public'));

app.set('view engine', 'ejs');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.get('/:domain/:id', async (req, res, next) => {
    const { domain, id } = req.params;
    const skip = +id - 1;

    if (skip >= 0) {
        let doc;
        try {
            doc = await Domain.findOne({ name: domain })
                .sort({ _id: 1 })
                .skip(skip)
                .limit(1);
        } catch (e) {
            req.error = e;
            next();
        }

        if (!doc) {
            res.redirect(`/${domain}`);
        } else {
            req.doc = doc;
            next();
        }
    } else {
        req.error = 'index is wrong';
        return next();
    }

    return undefined;
});


app.get('/favicon.ico', (req, res) => {
    res.status(404).send('TODO: Add favicon');
});

app.get('/:domain', async (req, res, next) => {
    const { domain } = req.params;
    const now = Date.now();

    const doc = await Domain.findOne({ name: domain })
        .sort({ _id: -1 })
        .skip(0)
        .limit(1);

    let records;
    try {
        records = await getRecords(domain);
    } catch (e) {
        req.error = e;
        return next();
    }

    records.forEach((item) => {
        delete item.name;
    });

    // TODO Works wrong with gogol.com
    records.sort((a, b) => (types[a.type] > types[b.type] ? 1 : -1));

    if (
        !doc || (!equalRecords(doc.records, records) && now - (24 * 60 * 60 * 1000) > doc.timestamp)
    ) {
        const domainDocument = new Domain({
            name: domain,
            timestamp: Date.now(),
            records
        });

        try {
            const savedDoc = await domainDocument.save();
            req.doc = savedDoc;
        } catch (e) {
            req.error = e;
        }

        return next();
    }

    req.doc = doc;
    return next();
});


app.get('/:domain/:id?', (req, res) => {
    const { doc, error } = req;

    if (!error) {
        const records = doc.records.filter(({ type }) => type in types);
        const data = groupBy(records, 'type');
        const { name: domain } = doc;

        res.render('layout.ejs', { data, domain, types, recordsInfo });
    } else {
        res.render('layout.ejs', { error });
    }
});


app.get('/', (req, res) => {
    res.render('layout.ejs');
});


app.listen(process.env.PORT);
