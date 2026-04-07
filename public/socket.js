//init is called inside of start-game click listener
const init = async () => {
    const socket = io.connect('http://localhost:7000');

    const initData = await socket.emitWithAck('init', {
        playerName: player.name,
    })
    //carico le orb
    orbs = initData.orbs;
    //salvo la posizione del player nell'array di tutti i player
    player.indexInPlayers = initData.indexInPlayers;

    setInterval( async () => {
        socket.emit('tock', {
            xVector: player.xVector ? player.xVector : 0.1,
            yVector: player.yVector ? player.yVector : 0.1,
        })
    }, 33)

    //console.log('orbs',orbs);
    draw();

    //the server sends out the location/data of all players 30/second
    socket.on('tick', (playersArray) => {
        //console.log('playersArray', playersArray);
        players = playersArray;

        if(players[player.indexInPlayers].locX && players[player.indexInPlayers].locY) {
            player.locX = players[player.indexInPlayers].locX;
            player.locY = players[player.indexInPlayers].locY;
        }
    })

    socket.on('orbSwitch', (orbData) => {
        orbs.splice(orbData.captureOrbI, 1, orbData.newOrb);
    });

    socket.on('playerAbsorbed', (absorbData) => {
        //imposto il messaggio a schermo
        document.querySelector('#game-message').innerHTML = `
        ${absorbData.absorbed} was absorbed by ${absorbData.absorbedBy}`;
        //mostra l'elemento
        document.querySelector('#game-message').style.opacity = 1;
        //lo nasconde dopo 2sec
        window.setTimeout(() => {
            document.querySelector('#game-message').style.opacity = 0;
        }, 2000);
    });

    socket.on('updateLeaderBoard', (leaderBoardArray) => {
        //console.log(`Leader board ${leaderBoardArray}`);
        leaderBoardArray.sort((a,b) => {
            return b.score - a.score;
        });

        document.querySelector('.leader-board').innerHTML = '';
        leaderBoardArray.forEach( p => {
            if(!p.name){
                return; //cancella l'iterazione corrente
            }
            document.querySelector('.leader-board').innerHTML += `
                <li class="leaderboard-player">${p.name} - ${p.score}</li>
            `;
            console.log(players[player.indexInPlayers].score);

            if(players[player.indexInPlayers].score === undefined){
                socket.disconnect();
                
                //hide the hidden on start elements
                const elements = Array.from(document.querySelectorAll('.hiddenOnStart'));
                elements.forEach(el => el.setAttribute('hidden', true));
                document.querySelector('.leader-board').innerHTML = '';
                document.querySelector('.player-score').innerHTML = '0';

                spawnModal.show();
                //document.querySelector('.player-score').innerHTML = `<div>Game over</div>`;
                
            } else {
                document.querySelector('.player-score').innerHTML = `${players[player.indexInPlayers].score}`;
            }
            
        });
    });
}




