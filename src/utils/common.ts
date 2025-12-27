// 对象转数组
 const objToArr = (obj:Record<string, string>) => {

  return Object.keys(obj).map((key) => ({
    name: key,
    version: obj[key],
   
  }));
};
// 取出数组中的name字段
const getName = (arr: { name: string; version: string | undefined}[]) => {
  return arr.map((item) => item.name);
};

export {
    objToArr,
    getName
}

