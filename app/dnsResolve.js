const dns = require('dns');
const lodash = require('lodash');

dns.setServers([
  '1.1.1.1',
  '8.8.8.8',
  '8.8.4.4',
]);

function resolveAny(domain) {
  return new Promise((resolve, reject) => {
    dns.resolveAny(domain, (e, data) => {
      if (e) {
        return reject(e);
      }

      return resolve(data);
    });
  });
}

const dnsResolvers = [
  'resolve4', 'resolve6', 'resolveCname', 'resolveMx', 'resolveNs', 'resolveSoa', 'resolveTxt', 'resolveSrv',
  'resolveNaptr', 'resolvePtr',
];

function getTypeByDNSResolver(resolver) {
  const type = resolver.replace('resolve', '').toUpperCase();
  if (type === '4') {
    return 'A';
  }

  if (type === '6') {
    return 'AAAA';
  }

  return type;
}

function resolveOneByOne(domain) {
  return new Promise((resolve) => {
    let resolvedCount = 0;
    const allData = [];
    dnsResolvers.forEach((dnsResolver) => {
      dns[dnsResolver](domain, (e, data) => {
        resolvedCount += 1;

        if (!e) {
          switch (dnsResolver) {
            case 'resolve4':
            case 'resolve6':
            case 'resolveNs':
            case 'resolveCname': // support.dnsimple.com
            case 'resolvePtr': // 12.62.25.23.in-addr.arpa
              allData.push(...data.map((value) => ({
                type: getTypeByDNSResolver(dnsResolver),
                value,
              })));
              break;
            case 'resolveMx':
            case 'resolveSrv': // _imaps._tcp.gmail.com
            case 'resolveNaptr': // 4.4.2.2.3.3.5.6.8.1.4.4.e164.arpa
              allData.push(...data.map((value) => ({
                type: getTypeByDNSResolver(dnsResolver),
                ...value,
              })));
              break;
            case 'resolveSoa':
              allData.push({
                type: getTypeByDNSResolver(dnsResolver),
                ...data,
              });
              break;
            case 'resolveTxt':
              allData.push(...data.map((value) => ({
                type: getTypeByDNSResolver(dnsResolver),
                entries: value,
              })));

              break;
            default:
          }
        }

        if (resolvedCount === dnsResolvers.length) {
          resolve(
            lodash(allData)
              .toPairs()
              .sortBy(0)
              .fromPairs()
              .value(),
          );
        }
      });
    });
  });
}

async function dnsResolve(domain) {
  try {
    // sometimes resolveAny is rejected
    return await resolveAny(domain);
  } catch (e) {
    // then resolve one type by one
    return resolveOneByOne(domain);
  }
}

module.exports = dnsResolve;
