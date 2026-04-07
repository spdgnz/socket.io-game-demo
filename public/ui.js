console.log('ui.js');

// set height and width of canvas = window
let wHeight = window.innerHeight;
let wWidth = window.innerWidth;

// canvas element init
const canvas = document.querySelector('#the-canvas');

// contex is used to draw
const context = canvas.getContext('2d');

//set the canvas to cover the window
canvas.height = wHeight;
canvas.width = wWidth;

// initialize player and orbs
const player = {}
let orbs = []; //global for all non player orbs
let players = []; //array of all players

// bootstrap modal variables
const loginModal = new bootstrap.Modal(document.querySelector('#loginModal'));
const spawnModal = new bootstrap.Modal(document.querySelector('#spawnModal'));


window.addEventListener('load', () => {
    //on page load, open the login modal
    loginModal.show()
})



document.querySelector('.name-form').addEventListener('submit', (e) => {
    e.preventDefault()

    //recupera il nickname inserito dall'utente
    player.name = document.querySelector('#name-input').value;
    //document.querySelector('.player-name').innerHTML = player.name;

    loginModal.hide();

    console.log(player);
    
    //show the hidden on start elements
    const elements = Array.from(document.querySelectorAll('.hiddenOnStart'));
    elements.forEach(el => el.removeAttribute('hidden'));

    init(); //init is inside socket.js
})


document.querySelector('.start-game').addEventListener('click', (e) => {
    
    // hide the start modal
    spawnModal.hide();
    loginModal.show();
})