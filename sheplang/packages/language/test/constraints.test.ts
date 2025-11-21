import { describe, it, expect } from 'vitest';
import { parseAndMap } from '../src/index';

// Battle-tested constraint mapping: required / optional / unique / max / default

describe('constraints → AppModel mapping', () => {
  it('maps required/optional/unique/max/default constraints correctly', async () => {
    const src = `app TestApp

data User:
  fields:
    name: text required unique
    age: number optional
    rating: number max = 5
    status: text default = "active"
    flag: text default = true`;

    const res = await parseAndMap(src, 'file://constraints.shep');
    expect(res.diagnostics.length).toBe(0);

    const user = res.appModel.datas[0];
    expect(user.name).toBe('User');
    const [name, age, rating, status, flag] = user.fields;

    // name: text required unique
    expect(name.name).toBe('name');
    expect(name.type).toBe('text');
    expect(name.constraints).toEqual([
      { type: 'required' },
      { type: 'unique' }
    ]);

    // age: number optional
    expect(age.name).toBe('age');
    expect(age.type).toBe('number');
    expect(age.constraints).toEqual([{ type: 'optional' }]);

    // rating: number max = 5
    expect(rating.name).toBe('rating');
    expect(rating.type).toBe('number');
    expect(rating.constraints).toEqual([{ type: 'max', value: '5' }]);

    // status: text default = "active"
    expect(status.name).toBe('status');
    expect(status.type).toBe('text');
    expect(status.constraints).toEqual([{ type: 'default', value: 'active' }]);

    // flag: text default = true  (serialized as boolean true)
    expect(flag.name).toBe('flag');
    expect(flag.type).toBe('text');
    expect(flag.constraints).toEqual([{ type: 'default', value: true }]);
  });
});
