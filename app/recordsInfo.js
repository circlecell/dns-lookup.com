const A = {
    fields: {
        Address: 'address'
    }
};

const AAAA = A;

const CNAME = {
    fields: {
        Data: 'data'
    }
};

const MX = {
    fields: {
        Priority: 'priority',
        Exchange: 'exchange'
    }
};

const NAPTR = {
    fields: {
        Order: 'order',
        Preference: 'preference',
        Flags: 'flags',
        Service: 'service',
        Regexp: 'regexp',
        Replacement: 'replacement'
    }
};

const NS = CNAME;

const PTR = CNAME;

const SOA = {
    fields: {
        Primary: 'primary',
        Admin: 'admin',
        Serial: 'serial',
        Refresh: 'refresh',
        Retry: 'retry',
        Expiration: 'expiration',
        Minimum: 'minimum'
    }
};

const SRV = {
    fields: {
        Priority: 'priority',
        Weight: 'weight',
        Port: 'port',
        Target: 'target'
    }
};

const TXT = {
    fields: {
        Data: ({ data }) => data.join('<br>')
    }
};

module.exports = {
    A,
    AAAA,
    CNAME,
    MX,
    NAPTR,
    NS,
    PTR,
    SOA,
    SRV,
    TXT
};
