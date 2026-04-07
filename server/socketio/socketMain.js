// socket.io related code
const io = require('../servers').io;
const app = require('../servers').app;

const checkForOrbCollisions = require('./checkCollisions').checkForOrbCollisions;
const checkForPlayerCollisions = require('./checkCollisions').checkForPlayerCollisions;

//==================CLASSES=====================
const Player = require ('./classes/Player.js');
const PlayerConfig = require ('./classes/PlayerConfig.js');
const PlayerData = require ('./classes/PlayerData.js');
const Orb = require ('./classes/Orb.js');
//==============================================

//makes an orbs array that will contain all 500/5000 NOT PLAYER orbs.
//every time one is absorb, make a new one
const orbs = [];
const settings = {
    defaultNumberOfOrbs: 3000, //number of orbs on the map
    defaultSpeed: 7, //player speed
    defaultSize: 12, // default playes size
    defaultZoom: 1.5, //as the player gets bigger, zoom needs to go out
    worldWidth: 2000,
    worldHeight: 2000,
    defaultGenericOrbSize: 5,
};

const players = [];
const playersForUsers = [];
let tickTockInterval;

//on server start to make our orbs
initGame();
//console.log(orbs);

io.on('connect', (socket) => {
    //a player has connected
    let player = {};

    socket.on('init', (playerObj, ackCallback) => {

        if(players.length === 0) {
             //issue an event to every connected socket, that is playing the game, 30 times per second
            tickTockInterval = setInterval(() => {
                io.to('game').emit('tick', playersForUsers);
            }, 33) // 1000/33 = 33.333333, there are 30, 33's in 1000 milliseconds
        }
       

        // aggiunge socket alla room game
        socket.join('game');

        //emit on join to init the game
        //make a playerConfig object - data specific to the player private
        const playerName = playerObj.playerName;
        const playerConfig = new PlayerConfig(settings);
        const playerData = new PlayerData(playerName,settings); //make a playerData object - data that everyone needs to know
        player = new Player(socket.id, playerConfig, playerData); //a master player object to house both
        players.push(player); //server use only
        playersForUsers.push(playerData);

        //send the orbs array back as an ack function
        ackCallback({
            orbs,
            indexInPlayers: playersForUsers.length-1
        });
    })

    // data from the client 
    socket.on('tock', (data) => {

        //if a tock came in before the player is set up
        // this is because the client kept tocking after disconnect
        if(!player.playerConfig){
            return;
        }

        speed = player.playerConfig.speed;
        xV = player.playerConfig.xVector = data.xVector;
        yV = player.playerConfig.yVector = data.yVector;

        //if player can move in the x, move
        if((player.playerData.locX > 5 && xV < 0) || (player.playerData.locX < settings.worldWidth) && (xV > 0)){
            player.playerData.locX += speed * xV;
        } else {
            player.playerConfig.xVector = -player.playerConfig.xVector
        }
        //if player can move in the y, move
        if((player.playerData.locY > 5 && yV > 0) || (player.playerData.locY < settings.worldHeight) && (yV < 0)){
            player.playerData.locY -= speed * yV;
        } else {
            player.playerConfig.yVector = -player.playerConfig.yVector
        }

        //========================================= ORBS COLLISIONS =======================================
        //check for the tocking player to hit orbs
        const captureOrbI = checkForOrbCollisions(player.playerData, player.playerConfig, orbs, settings);

        //funcion returns null or the index of the orb touched
        if(captureOrbI !== null) {
            //remove the orb that needs to be replaced, and add a new orb
            orbs.splice(captureOrbI, 1, new Orb(settings));

            //update the clients with the new orb
            const orbData = {
                captureOrbI,
                newOrb: orbs[captureOrbI] //nuova orb che ha rimpiazzato la vecchia
            }

            //emit the eaten orb, and the new one
            io.to('game').emit('orbSwitch', orbData);
            
            // emit the upgraded leaderboard
            io.to('game').emit('updateLeaderBoard', getLeaderBoard());
        }

        //========================================= PLAYER COLLISIONS =====================================

        const absorbData = checkForPlayerCollisions(player.playerData, player.playerConfig, players, playersForUsers, socket.id);
        if(absorbData){
            io.to('game').emit('playerAbsorbed', absorbData);

            // emit the upgraded leaderboard
            io.to('game').emit('updateLeaderBoard', getLeaderBoard());
        }
    })

    socket.on('disconnect', (reason) => {
        //console.log('reason',reason);
        //loop through players ad find the player with this socketId, and splice it out
        for(let i=0; i< players.length; i++){
            if(players[i].socketId === player.socketId){
                players.splice(i, 1, {});
                playersForUsers.splice(i, 1, {});
            }
        }
        //check to see if players is empty. if so stop "ticking"
        if(players.length === 0) {
            clearInterval(tickTockInterval);
        }
    });
})


function initGame() {
    //loop defaultNumberOfOrbs times, apush a new orb into our array
    for(let i=0; i<settings.defaultNumberOfOrbs; i++){
        orbs.push(new Orb(settings));
    }
}

function getLeaderBoard() {
    //ritorno la leaderboard
    const leaderBoardArray = players.map( player => {
        if(player.playerData){
            return {
                name: player.playerData.name,
                score: player.playerData.score,
            };
        } else {
            return {};
        }
    });
    return leaderBoardArray;
}