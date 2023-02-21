const filterByKeys = (item: any, keys: string[]) => {
  return Object.keys(item)
    .filter((key) => keys.includes(key))
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: item[key],
      };
    }, {});
};

// https://stackoverflow.com/questions/27030/comparing-arrays-of-objects-in-javascript
const objectsEqual = (o1: any, o2: any): boolean =>
  typeof o1 === 'object' && Object.keys(o1).length > 0
    ? Object.keys(o1).length === Object.keys(o2).length && Object.keys(o1).every((p) => objectsEqual(o1[p], o2[p]))
    : o1 === o2;

const arraysEqual = (a1: any[], a2: any[]) =>
  a1.length === a2.length && a1.every((o: any, idx: number) => objectsEqual(o, a2[idx]));

export const isEqualDeep = (data: any[], oldData: any[], observedKeys: string[]): boolean => {
  const filteredData = data.map((item: { [key: string]: any }) => filterByKeys(item, observedKeys));
  const filteredOldData = oldData.map((item: { [key: string]: any }) => filterByKeys(item, observedKeys));

  return arraysEqual(filteredData, filteredOldData);
};
