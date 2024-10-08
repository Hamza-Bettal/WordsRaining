let params = new URLSearchParams(window.location.search);
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let level = params.get('level');
localStorage.setItem('currentlevel', level);
document.getElementById('song').loop = true;
canvas.width = window.innerWidth + 500;
canvas.height = window.innerHeight;
let asteroids = [];
let time = 0.00;
let besttime = localStorage.getItem('besttime');

let spawnlevel = 200 / level;
let speed = 3 * level;

class Asteroid
{
    constructor(shape, x, y, speed, size)
    {
        this.shape = shape;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.size = size;
    }
    isCollidingWith(player)
    {
        if (this.shape === 'circle')
        {
            const dx = this.x - player.x;
            const dy = this.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return (distance < this.size + player.size);
        }
        else if (this.shape === 'square')
            return (this.x < player.x + player.size && this.x + this.size > player.x && this.y < player.y + player.size && this.y + this.size > player.y);
    }
    draw()
    {
        ctx.fillStyle = '#fff';
        if (this.shape === 'square')
        {
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
        else if(this.shape === 'circle')
        {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, true);
            ctx.fill();
        }
    }
    update()
    {
        this.y += this.speed;
    }
}
class Player
{
    constructor(x, y, size)
    {
        this.x = x;
        this.y = y;
        this.size = size;
    }
    draw()
    {
        let playerImage = new Image();
        playerImage.src = "imgs/airplane.png";
        ctx.drawImage(playerImage, this.x - 75, this.y - 75, 150, 150);
    }
}

let player = new Player(canvas.width / 2, canvas.height / 2, 30);
let xrandom = [];

function mousepos(event)
{
    player.x = event.clientX;
    player.y = event.clientY;
}

canvas.addEventListener('mousemove', mousepos);

function spawnAsteroid()
{
    xrandom.push(Math.random() * (canvas.width) * 0.9);
    const shape = Math.random() < 0.5 ? 'square' : 'circle';
    const size = (Math.random() + 0.3) * 50;
    asteroids.push(new Asteroid(shape, xrandom[xrandom.length - 1] , -50, (Math.random() + 0.1) * 2 * speed, size));
}

setInterval(function()
{
    time += 0.01;
}, 10);

let timeInt = setInterval(function()
{
    spawnlevel -= 3;
    if (spawnlevel < 10)
        spawnlevel = 10;
    speed += 0.3;
}, 3000);

function showMessage(msg)
{
    let messageDiv = document.createElement('div');

    messageDiv.style = 'right: 40px; top: 40px; position: absolute; font-size: 40px; opacity: 0; transition: opacity 1s; user-select: none;';
    messageDiv.textContent = msg;
    document.body.appendChild(messageDiv);

    setTimeout(function()
    {
        messageDiv.style.opacity = '1';
    }, 100);

    setTimeout(function()
    {
        messageDiv.style.opacity = '0';
        setTimeout(function()
        {
            document.body.removeChild(messageDiv);
        }, 2000);
    }, 3000 / level);
}
showMessage('Click Esc to pause the game');

let animationFrameId;

function updateGame()
{
    let i = 0;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '50px "VT323", monospace';
    ctx.fillText('Time: ' + time.toFixed(2), 30, 60);
    player.draw();
    while (i < asteroids.length)
    {
        const asteroid = asteroids[i];
        asteroid.update();
        asteroid.draw();
        if (asteroid.y > canvas.height + asteroid.size)
        {
            asteroids.splice(i, 1);
            xrandom.splice(i, 1);
            continue;
        }
        if (asteroid.isCollidingWith(player))
        {
            var song = document.querySelector('#song');
            song.src = 'sounds/die.mp3';
            song.load();
            song.play();
            song.loop = false;
            if (besttime === null)
                besttime = 0;
            if (time > +besttime)
            {
                besttime = time.toFixed(2);
                localStorage.setItem('besttime', besttime);
            }
            document.getElementById('highScoreDisplay').innerText = 'High Surviving time: ' + besttime;
            document.getElementById('scoreDisplay').innerText = 'Your Surviving time: ' + time.toFixed(2);
            document.getElementById('loseScreen').style.display = 'block';
             return ;
        }
        i++;
    }
    animationFrameId = requestAnimationFrame(updateGame);
}

function restartGame()
{
    let level = localStorage.getItem('currentlevel');
    window.location = 'game2.html?level=' + level;
}

function resumeGame()
{
    document.getElementById('pauseScreen').style.display = 'none';
    setInterval(spawnAsteroid, spawnlevel);
    animationFrameId = requestAnimationFrame(updateGame);
}

let thegame = setInterval(spawnAsteroid, spawnlevel);

document.addEventListener('keydown', function(event)
{
    if (event.key === 'Escape')
    {
        cancelAnimationFrame(animationFrameId);
        clearInterval(thegame);
        clearInterval(timeInt);
        document.getElementById('pauseScreen').style.display = 'block';
    }
});
updateGame();