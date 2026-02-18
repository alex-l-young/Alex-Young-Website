let particles;
let canvasX;
let canvasY;
let mx = [0, 0];
let my = [0, 0];
let gravSlider;
let g = 0.25;

function setup() {
  let container = select('.simulation-stage');
  
  // Use the container's width, or fallback to window width
  let w = container ? container.width : windowWidth;
  let h = container ? container.height : windowHeight/2; // Match CSS height

  cnv = createCanvas(w, h);
  
  if (container) {
    cnv.parent(container);
  }

  canvasX = cnv.width;
  canvasY = cnv.height;
  
  particles = [];

  gravSlider = createSlider(0, 100, 25);
  
  if (container) {
    gravSlider.parent(container);
    gravSlider.style('position', 'absolute');
    gravSlider.style('top', '20px');
    gravSlider.style('left', '20px');
    gravSlider.style('z-index', '10'); // Ensure it sits on top
  } else {
    gravSlider.position(20, 20);
  }
}

function draw() {
  background('#0f0f0f');
  g = gravSlider.value() / 100;

  mx.splice(0, 0, mouseX);
  mx.pop();
  my.splice(0, 0, mouseY);
  my.pop();

  for (i = 0; i < particles.length; i++) {
    particles[i].runParticle();
    if (particles[i].isDead()) {
      particles.splice(i,1);
    }
  }
}

function mouseDragged() {
  // Check bounds so we only draw when inside the box
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    this.p = new Particle();
    particles.push(this.p);
  }
}

let Particle = function() {
  this.dt = 1;
  this.g = -0.25;
  this.pos = createVector(mouseX, mouseY);
  let velX = mx[0] - mx[1];
  let velY = my[0] - my[1];
  this.vel = createVector(velX, velY);
  this.accel = g;
  this.r = 10;
  this.initLifespan = 2000;
  this.lifespan = this.initLifespan;
  this.R = random()*255;
  this.G = random()*255;
  this.B = random()*255;
}

Particle.prototype.createParticle = function() {
  noStroke();
  fill('rgba(200,169,169)');
  circle(this.pos.x,this.pos.y,this.r);
}

Particle.prototype.updatePosition = function() {
  this.checkCollision();
  this.accel = this.acceleration();

  let velX = this.vel.x + this.accel.x * this.dt;
  let velY = this.vel.y + this.accel.y * this.dt;

  let posX = this.pos.x + this.vel.x * this.dt;
  let posY = this.pos.y + this.vel.y * this.dt;

  this.vel = createVector(velX, velY);
  this.pos = createVector(posX, posY);

  this.lifespan -= 0.005 * this.initLifespan;
}

Particle.prototype.displayParticle = function() {
  let alpha = 255 * (this.lifespan / this.initLifespan);
  fill(this.R, this.G, this.B);
  noStroke();
  circle(this.pos.x,this.pos.y,this.r);
}

Particle.prototype.isDead = function() {
  return this.lifespan <= 0;
}

Particle.prototype.runParticle = function() {
  this.updatePosition();
  this.displayParticle();
}

Particle.prototype.checkCollision = function() {
  if (this.pos.x >= canvasX && this.vel.x > 0) {
    this.vel.x = -this.vel.x * 0.75;
  } else if (this.pos.x <= 0 && this.vel.x < 0) {
    this.vel.x = -this.vel.x * 0.75;
  } else if (this.pos.y >= canvasY && this.vel.y > 0) {
    this.vel.y = -this.vel.y * 0.75;
  } else if (this.pos.y <= 0 && this.vel.y < 0) {
    this.vel.y = -this.vel.y * 0.75;
  }
}

Particle.prototype.acceleration = function() {
  return createVector(0, g);
}