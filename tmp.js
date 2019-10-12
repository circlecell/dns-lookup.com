const dns = require('dns');

const methodNames = [
  'resolve4', 'resolve6', 'resolveCname', 'resolveMx', 'resolveNaptr',
  'resolveNs', 'resolvePtr', 'resolveSoa', 'resolveSrv', 'resolveTxt',/*'resolveAny'*/
];

for (const methodName of methodNames) {
    dns[methodName]('habr.com', (e, data) => console.log(methodName, data));
}
