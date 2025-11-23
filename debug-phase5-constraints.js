/**
 * Debug constraint parsing structure
 */

import { parseShep } from './sheplang/packages/language/dist/index.js';

(async function() {

const tests = [
  {
    name: 'min',
    code: `app TestApp { data Product { fields: { price: number min=0 } } view Dashboard { list Product } }`
  },
  {
    name: 'max',
    code: `app TestApp { data Rating { fields: { score: number max=5 } } view Dashboard { list Rating } }`
  },
  {
    name: 'minLength',
    code: `app TestApp { data Account { fields: { username: text minLength=3 } } view Dashboard { list Account } }`
  },
  {
    name: 'maxLength',
    code: `app TestApp { data Post { fields: { title: text maxLength=100 } } view Dashboard { list Post } }`
  },
  {
    name: 'email',
    code: `app TestApp { data Contact { fields: { emailAddr: text email=true } } view Dashboard { list Contact } }`
  },
  {
    name: 'pattern',
    code: `app TestApp { data Code { fields: { zipCode: text pattern="^[0-9]{5}$" } } view Dashboard { list Code } }`
  }
];

for (const t of tests) {
  console.log(`\n${t.name}:`);
  const result = await parseShep(t.code);
  if (result.appModel) {
    const field = result.appModel.datas[0].fields[0];
    console.log('  Constraints:', JSON.stringify(field.constraints, null, 2));
  } else {
    console.log('  Failed to parse');
  }
}

})();
