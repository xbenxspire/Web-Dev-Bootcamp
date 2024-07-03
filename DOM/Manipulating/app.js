const allLinks = document.querySelectorAll('a');

// for (let link of allLinks) {
//     link.innerText = 'I AM A LINK!!!!'
// }


for (let link of allLinks) {
    link.style.color = 'rgb(0, 108, 134)';
    link.style.textDecorationColor = 'magenta';
    link.style.textDecorationStyle = 'wavy'
}


const spans = document.querySelectorAll('h1 span');

let i = 0;
for (const span of spans) {
    span.style.color = colors[i];
    i++;
}

const lis = document.querySelectorAll('li');

for (const li of lis) {
    li.classList.toggle('highlight');
}


const containerDiv = document.querySelector('#container');

for (let i = 0; i < 100; i++) {
    const button = document.createElement('button');
    button.innerText = 'Hey!';
    containerDiv.appendChild(button);
}