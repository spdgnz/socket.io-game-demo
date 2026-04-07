
player.locX = 0;
player.locY = 0;

//=========================
//=========DRAW============
//=========================

const draw = () => {
    //reset the context translate back to default
    context.setTransform(1,0,0,1,0,0);

    //clearRect clears out the canvas so we can draw on a clean canvas next frame
    context.clearRect(0,0, canvas.width, canvas.height);
    
    //clamp the screen/viewport to the player location (x,y)
    const camX = -player.locX + canvas.width/2;
    const camY = -player.locY + canvas.height/2;

    //translate moves the canvas to where the player is at
    context.translate(camX, camY);

    //draw all the players
    players.forEach( (p) => {

        if(!p.color || !p.locX || !p.locY || !p.radius){
            //console.log('se l'oggetto player è vuoto esco da draw')
            return
        }
        context.beginPath();
        context.fillStyle = p.color;

        //draw arc/circle
        //arg 1 and 2 are the center x and center y of the arc
        //arg 3 radius of the circle
        //arg 4 starting angle 0 is 3:00
        //arg 5 ending angle of the arc in randians Pi = 90deg
        context.arc(
            p.locX,
            p.locY,
            p.radius,
            0,
            Math.PI*2
        ); 
        
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = 'rgb(255,255,255)';
        context.stroke();
    });
    

    // draw all the orbs
    orbs.forEach(orb => {
        context.beginPath();
        context.fillStyle = orb.color;
        context.arc(orb.locX, orb.locY, orb.radius, 0, Math.PI*2); //draw arc-circle
        context.fill()
    })

    // requestAnimationFrame is like a controled loop it runs recursively, every frame
    requestAnimationFrame(draw) 
}


canvas.addEventListener('mousemove',(event)=>{
    //console.log(event)
    const mousePosition = {
        x: event.clientX,
        y: event.clientY
    };
    const angleDeg = Math.atan2(mousePosition.y - (canvas.height/2), mousePosition.x - (canvas.width/2)) * 180 / Math.PI;
    if(angleDeg >= 0 && angleDeg < 90){
        xVector = 1 - (angleDeg/90);
        yVector = -(angleDeg/90);
        console.log("Mouse is in the lower right quadrant")
    }else if(angleDeg >= 90 && angleDeg <= 180){
        xVector = -(angleDeg-90)/90;
        yVector = -(1 - ((angleDeg-90)/90));
        console.log("Mouse is in the lower left quadrant")
    }else if(angleDeg >= -180 && angleDeg < -90){
        xVector = (angleDeg+90)/90;
        yVector = (1 + ((angleDeg+90)/90));
        console.log("Mouse is in the upper left quadrant")
    }else if(angleDeg < 0 && angleDeg >= -90){
        xVector = (angleDeg+90)/90;
        yVector = (1 - ((angleDeg+90)/90));
        console.log("Mouse is in the upper right quadrant")
    }

    player.xVector = xVector ? xVector : .1;
    player.yVector = yVector ? yVector : .1;
})



