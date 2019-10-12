const dns = require('dns');

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
  'resolve4', 'resolve6', 'resolveCname', 'resolveMx', 'resolveNs',
  'resolveNaptr', 'resolvePtr', 'resolveSoa', 'resolveSrv', 'resolveTxt'
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
          //if (typeof data[0] === 'string') {
            // convert flat arrays into objects
            // { type: 'TXT', entries: ['foo']}
            // { type: 'CNAME', value: bar }
            /*allData.push(data.map((value) => {
              if (dnsResolver === 'resolveTxt') {
                return { type: 'TXT', entries: value };
              }

              return { type: getTypeByDNSResolver(dnsResolver), value };
            }));*/
          //} else {
          console.log(dnsResolver, data);

          switch(dnsResolver) {
            case 'resolve4':
            case 'resolve6':
            case 'resolveNs':
            case 'resolveCname':
              allData.push(...data.map((value) => ({
                type: getTypeByDNSResolver(dnsResolver),
                value,
              })))
              break;
            case 'resolveMx':
              allData.push(...data.map((value) => ({
                type: getTypeByDNSResolver(dnsResolver),
                ...value,
              })))
              break;
            case 'resolveSoa':
            allData.push({
              type: getTypeByDNSResolver(dnsResolver),
              ...data,
            })
            default:
            /*allData.push(...(data instanceof Array ? data.map((item) => {
              return { ...item, type: getTypeByDNSResolver(dnsResolver)}
            }) : [{
              ...data, type: getTypeByDNSResolver(dnsResolver)
            }]));*/
          }

        //   }
        } else {
          // console.log(domain, dnsResolver, e)
        }

        if (resolvedCount === dnsResolvers.length) {
          resolve(allData);
        }
      });
    });
  });
}

async function dnsResolve(domain) {
  return resolveOneByOne(domain);
  try {
    return await resolveAny(domain);
  } catch (e) {
    return resolveOneByOne(domain);
  }
}


module.exports = dnsResolve;
