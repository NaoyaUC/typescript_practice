
answerSource = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
// inputArr = ["1","2","3"]
inputArr = ["1", "2", "s"]

//
const isAllAnswerSourceOption = inputArr.every((val) =>
  answerSource.includes(val)
);
//
const isAllDiffrentValues = inputArr.every(
  (val, i) => inputArr.indexOf(val) === i
);

console.log(isAllAnswerSourceOption);
console.log(isAllDiffrentValues);