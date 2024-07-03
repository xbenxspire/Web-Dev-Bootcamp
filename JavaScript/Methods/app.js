const myMath = {
    PI: 3.14159,
    square(num) {
        return num * num;
    },
    cube(num) {
        return num ** 3;
    }
}


const square = {
    area: function (side) {
        return side * side;
    },
    perimeter: function (side) {
        return side * 4;
    }
}

square.area(10)
square.perimeter(10)


const cat = {
    name: 'Blue Steele',
    color: 'grey',
    breed: 'scottish fold',
    meow() {
        console.log("THIS IS:", this)
        console.log(`${this.name} says MEOWWWW`);
    }
}

const meow2 = cat.meow;


const hen = {
    name: 'Helen',
    eggCount: 0,
    layAnEgg: function () {
        this.eggCount++;
        console.log(this.eggCount);
        return 'EGG';
    }
};