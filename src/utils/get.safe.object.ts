export function getSafeObject(object: {}, fieldsToRemove: string[]) {
  const newObj = { ...object };
  for (const key of Object.keys(newObj)) {
    const objKey = key as keyof typeof newObj;
    if (
      fieldsToRemove.includes(objKey as string) &&
      newObj.hasOwnProperty(objKey)
    ) {
      delete newObj[objKey];
    }
  }
  return newObj;
}
