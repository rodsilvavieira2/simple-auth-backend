export const filterAvailableParams = (params: string[], data: any) => {
  const dataValidated = params.filter((field) => {
    if (data[field]) {
      return true;
    }

    return false;
  });

  const obj = dataValidated.reduce((acc, current) => {
    acc[current] = data[current];

    return acc;
  }, {});

  return obj;
};
