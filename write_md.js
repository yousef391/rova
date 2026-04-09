const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/algeria.json', 'utf8'));

let md = `# Yalidine Delivery Fees (from Oran)
*Note: All prices below reflect the standard Yalidine Zone-based delivery fees minus your requested 200 DA discount.*

| Wilaya ID | Wilaya Name | Pre-Discount Standard | Your Final Fee (-200 DA) |
|---|---|---|---|
`;

data.wilayas.forEach(w => {
  let std = w.delivery_fee + 200;
  md += `| ${w.wilaya_id} | ${w.wilaya_name_latin} | ${std} DA | **${w.delivery_fee} DA** |\n`;
});

// Assuming user app data dir for artifacts is:
// C:\Users\DZ LAPTOPS\.gemini\antigravity\brain\f4184b91-3f4a-4f66-8a38-fa57c4a1da6b/
fs.writeFileSync('C:\\Users\\DZ LAPTOPS\\.gemini\\antigravity\\brain\\f4184b91-3f4a-4f66-8a38-fa57c4a1da6b\\yalidine_fees.md', md);
console.log("Done");
