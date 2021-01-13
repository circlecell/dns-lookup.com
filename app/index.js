/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const { groupBy } = require('lodash');

const Domain = require('./models/domain');
const equalRecords = require('./equalrecords');
const dnsResolve = require('./dnsResolve');

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

app.get('/:domain', async (req, res, next) => {
  const { domain } = req.params;
  const now = Date.now();

  const doc = await Domain.findOne({ name: domain })
    .sort({ _id: -1 })
    .skip(0)
    .limit(1);

  let records;
  try {
    records = await dnsResolve(domain);
  } catch (e) {
    req.error = e;
    return next();
  }

  if (
    !doc || (!equalRecords(doc.records, records) && now - (24 * 60 * 60 * 1000) > doc.timestamp)
  ) {
    const domainDocument = new Domain({
      name: domain,
      timestamp: Date.now(),
      records,
    });

    try {
      await domainDocument.save();
    } catch (e) { console.error(e); }
  }

  req.records = records;

  return next();
});

app.get('/:domain/:id?', (req, res) => {
  const { records, error } = req;
  const { domain } = req.params;

  if (!error) {
    const data = groupBy(records, 'type');

    res.render('layout.ejs', {
      data, domain,
    });
  } else {
    res.render('layout.ejs', { error });
  }
});

app.get('/', (req, res) => {
  res.render('layout.ejs');
});

app.listen(process.env.PORT);
