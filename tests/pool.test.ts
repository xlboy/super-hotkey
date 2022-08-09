import { Pool } from '../src/imple/pool';

interface Person {
  name: string;
  age: number;
}

const personList: Person[] = [
  { age: 19, name: '张三' },
  { age: 20, name: '王二狗' },
  { age: 20, name: '李大狗' }
];

function createPersonPool() {
  return new Pool<Person>();
}

function fillPersonPool(pool: Pool<Person>) {
  personList.forEach(i => {
    pool.addEntry(i);
  });
}

describe('pool test', () => {
  it('instance test', () => {
    const instance = new Pool();

    expect(instance).not.toBeNull();
  });

  it('add and size test', () => {
    const personPool = createPersonPool();

    expect(personPool.size()).toBe(0);
    fillPersonPool(personPool);
    expect(personPool.size()).toBe(3);
  });

  it('clear test', () => {
    const personPool = createPersonPool();

    fillPersonPool(personPool);
    personPool.clear();
    expect(personPool.size()).toBe(0);
  });

  it('getEntry test', () => {
    const personPool = createPersonPool();

    fillPersonPool(personPool);
    expect(personPool.getEntry({ age: 19 })).toEqual(personList[0]);
    expect(personPool.getEntry({ name: '王二狗' })).toEqual(personList[1]);
    expect(personPool.getEntry({ name: '王二狗', age: 20 })).toEqual(personList[1]);
    expect(personPool.getEntry({ name: '王二狗', age: 19 })).toBeUndefined();
  });

  it('getEntrys test', () => {
    const personPool = createPersonPool();

    fillPersonPool(personPool);
    expect(personPool.getEntrys({ age: 20 })).toEqual([personList[1], personList[2]]);
  });
});
