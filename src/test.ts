const sayHello = (name: string) => {
    return `Hi, ${name}!`;
};

console.log(sayHello('naoya'))
process.stdout.write(sayHello('naoya'))


// let neverValue: never

// neverValue = "nddd" //Type 'string' is not assignable to type 'never'.
// neverValue = 20     //Type 'number' is not assignable to type 'never'. 
// neverValue = null   //Type 'null' is not assignable to type 'never'.
// neverValue = undefined //Type 'undefined' is not assignable to type 'never'.

type Person = {
    name: string
    age: number
}



const getName = (person: Person) => {
    return person.name
}

const getAge = (person: Person) => {
    return person.age
}

// type sd = string

// const aef = (name: sd) => {
//     return name + "dd"
// };


// type Person = {
//     height: number
//     width: number
// }