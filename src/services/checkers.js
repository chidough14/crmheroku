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

function checkFileType(fileName) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  const pdfExtensions = ['pdf'];
  const csvExtensions = ['csv'];
  const excelExtensions = ['xls', 'xlsx'];

  const fileExtension = fileName?.split('.').pop().toLowerCase();

  if (imageExtensions.includes(fileExtension)) {
    return 'image';
  } else if (pdfExtensions.includes(fileExtension)) {
    return 'pdf';
  } else if (csvExtensions.includes(fileExtension)) {
    return 'csv';
  } else if (excelExtensions.includes(fileExtension)) {
    return 'excel';
  } else {
    return 'unknown';
  }
}

export { arraysHaveSameContents, checkEmptyString, checkFileType }

