const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/yalidine_meta.json', 'utf8'));

// Official Yalidine E-commerce Tarif à Domicile (from Oran) per Zone
const zonePrices = {
  0: 590, // Oran (sometimes labeled Zone 0 or mapped internally)
  1: 700,
  2: 900,
  3: 950,
  4: 1050,
  5: 1600,
  6: 1600
};

// Map to the new schema that JacketShowcase expects
const payload = {
  wilayas: data.wilayas.map(w => {
    // Oran is 31, if it's 31 we force Zone 0 price explicitly just in case Yalidine meta marked it differently
    let basePrice = w.id === 31 ? 590 : (zonePrices[w.zone] || 900);
    return {
      wilaya_id: w.id.toString(),
      wilaya_name_latin: w.name,
      // Minus 200 DA discount
      delivery_fee: Math.max(0, basePrice - 200)
    };
  }),
  communes: data.communes.map(c => ({
    commune_id: c.id,
    wilaya_id: c.wilaya_id.toString(),
    commune_name_latin: c.name
  }))
};

fs.writeFileSync('data/algeria.json', JSON.stringify(payload, null, 2));
console.log("data/algeria.json rewritten with Yalidine strict names and discounted prices!");
