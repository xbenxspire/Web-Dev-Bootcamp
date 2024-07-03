function singSong() {
    console.log("DO");
    console.log("RE");
    console.log("MI");
}

function greet(firstName, lastName) {
    console.log(`Hey there, ${firstName} ${lastName[0]}.`)
}

function repeat(str, numTimes) {
    let result = '';
    for (let i = 0; i < numTimes; i++) {
        result += str;
    }
    console.log(result);
}


function add(x, y) {
    if (typeof x !== 'number' || typeof y !== 'number') {
        return false;
    }
    return x + y;
}


function rant(message) {
    console.log(message.toUpperCase());
    console.log(message.toUpperCase());
    console.log(message.toUpperCase());
}

rant("I hate beets");


function multiply(x, y) {
    return x * y;
}
multiply(2, 3);
multiply(9, 9);
multiply(5, 5);


function isShortsWeather(temperature) {
    if (temperature >= 75)
        return true;
    else if (temperature < 75)
        return false;
}


isShortsWeather(80);
isShortsWeather(48);
isShortsWeather(75);

function lastElement(arr) {
    if (arr.length === 0) {
        return null
    } else {
        return arr[arr.length - 1]
    }
}


function capitalize(str) {
    const newString = str[0].toUpperCase() + str.slice(1)
    return newString;
}


function sumArray(arrNums) {
    let sum = 0
    for (let i = 0; i < arrNums.length; i++) {
        sum += arrNums[i]
    }
    return sum
}

const returnDay = (day) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    if (day < 1 || day > 7) {
        return null
    }
    return days[day - 1]
}


// singSong()
// singSong()
// singSong()
// singSong()
// singSong()
// singSong()
// singSong()
// singSong()
// singSong()
// singSong()
// singSong()

