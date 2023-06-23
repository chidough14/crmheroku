const arraysHaveSameContents = (array1, array2) => {
  // Check if the arrays have the same length
  if (array1?.length !== array2?.length) {
    return false;
  }

  if (!array1?.length && !array2?.length) {
    return false;
  }

  // Sort the arrays to ensure consistent ordering for comparison
  const sortedArray1 = array1?.slice().sort();
  const sortedArray2 = array2?.slice().sort();

  // Compare each element in the arrays
  for (let i = 0; i < sortedArray1?.length; i++) {
    if (sortedArray1[i] !== sortedArray2[i]) {
      return false;
    }
  }

  return true;
}

const checkEmptyString = (obj) => {
  for (let prop in obj) {
    if (obj[prop] === "") {
      return true;
    }
  }
  return false;
}

export { arraysHaveSameContents, checkEmptyString }

