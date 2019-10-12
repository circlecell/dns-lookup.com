const equal = require('deep-equal');

module.exports = (records1, records2) => {
  if (equal(records1, records2)) {
    return true;
  }

  for (let i = 0; i < records1.length; i++) {
    const rec1 = records1[i];
    let found = false;
    for (let j = 0; j < records2.length; j++) {
      const rec2 = records2[j];

      if (equal(rec1, rec2)) {
        found = true;
        break;
      }
    }

    if (!found) {
      return false;
    }
  }

  return true;
};
