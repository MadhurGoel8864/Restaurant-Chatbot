const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisioncanvas = document.getElementById('collisioncanvas');
const collisionctx = collisioncanvas.getContext('2d');
collisioncanvas.width = window.innerWidth;
collisioncanvas.height = window.innerHeight;

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;
let score = 0;
let gameover = false;
ctx.font = '50px Impact';
let explosions = [];
let ravens = [];
let particles = [];

class Raven {
    constructor() {
        this.spritewidth = 271;
        this.spriteheight = 194;
        this.speedmodifier = Math.random() * 0.6 + 0.4;
        this.width = this.spritewidth * this.speedmodifier;
        this.height = this.spriteheight * this.speedmodifier;

        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedfordeletion = false;
        this.image = new Image();
        this.image.src = 'img/raven.png'; // Make sure this path is correct
        this.frame = 0;
        this.maxframe = 4;
        this.timeSinceFlap = 0;
        this.flapinterval = Math.random() * 50 + 50;
        this.randomcolors = [
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255)
        ];
        this.color = 'rgb(' + this.randomcolors[0] + ',' + this.randomcolors[1] + ',' + this.randomcolors[2] + ')';
        this.hastrail=Math.random()>0.5;
    }

    update(deltaTime) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) this.markedfordeletion = true;
        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.flapinterval) {
            if (this.frame > this.maxframe) {
                this.frame = 0;
            } else {
                this.frame++;
            }
            this.timeSinceFlap = 0;
            if(this.hastrail){
                for(let i =0;i<5 ;i++){
            particles.push(new Particle(this.x, this.y, this.width, this.color));
                }
            }
        }
        if (this.x < 0 - this.width) gameover = true;
    }

    draw() {
        collisionctx.fillStyle = this.color;
        collisionctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spritewidth, 0, this.spritewidth, this.spriteheight, this.x, this.y, this.width, this.height);
    }
}

class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = 'img/boom.png';
        this.spritewidth = 200;
        this.spriteheight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = 'sou/ice attack 2.wav';
        this.timesincelastframe = 0;
        this.frameinterval = 200;
        this.markedfordeletion = false;
    }
    update(deltaTime) {
        console.log("Updating explosion");
        if (this.frame === 0) this.sound.play();
        this.timesincelastframe += deltaTime;
        if (this.timesincelastframe > this.frameinterval) {
            this.frame++;
            this.timesincelastframe = 0;
            if (this.frame > 5) {
                this.markedfordeletion = true;
            }
        }
    }

    draw() {
        ctx.drawImage(this.image, this.frame * this.spritewidth, 0, this.spritewidth, this.spriteheight, this.x, this.y - this.size / 4, this.size, this.size);
    }

}

class Particle {
    constructor(x, y, size, color) {
        this.size = size;
        this.x = x +this.size/2 + Math.random() *50-25;
        this.y = y + this.size/3+ Math.random() *50-25;
      
        this.radius = Math.random() * this.size / 10;
        this.maxradius = Math.random() * 20 + 35;
        this.markedfordeletion = false;
        this.speedx = Math.random() * 1 + 0.5;
        this.color = color;
    }
    update() {
        this.x += this.speedx;
        this.radius += 0.3;
        if (this.radius > this.maxradius -5) this.markedfordeletion = true;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha=1-this.radius/this.maxradius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawscore() {
    ctx.fillStyle = 'black';
    ctx.fillText('score:' + score, 50, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('score:' + score, 50, 80);
}

function drawgameover() {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('GAME OVER, SCORE:' + score, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER, SCORE:' + score, canvas.width / 2 + 5, canvas.height / 2 + 5);
}

window.addEventListener('click', function (e) {
    const detectpixelcolor = collisionctx.getImageData(e.clientX, e.clientY, 1, 1);
    const pc = detectpixelcolor.data;
    ravens.forEach(object => {
        if (object.randomcolors[0] === pc[0] && object.randomcolors[1] === pc[1] && object.randomcolors[2] === pc[2]) {
            object.markedfordeletion = true;
            score++;
            explosions.push(new Explosion(object.x, object.y, object.width));
            console.log(explosions);
        }
    });

    console.log(detectpixelcolor);
});

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionctx.clearRect(0, 0, canvas.width, canvas.height);
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    // console.log(deltaTime);
    timeToNextRaven += deltaTime;
    if (timeToNextRaven > ravenInterval) {
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort(function (a, b) {
            return b.width - a.width;
        });
    }
    drawscore();

    let allObjects = [...particles,...ravens, ...explosions];
    allObjects.forEach(object => object.update(deltaTime));
    allObjects.forEach(object => object.draw());
    ravens = ravens.filter(object => !object.markedfordeletion);
    explosions = explosions.filter(object => !object.markedfordeletion);
    particles = particles.filter(object => !object.markedfordeletion);

    if (!gameover) requestAnimationFrame(animate);
    else drawgameover();
}

animate(0);
