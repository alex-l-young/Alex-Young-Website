let particles;
let canvasX;
let canvasY;
let mx = [0, 0];
let my = [0, 0];
let gravSlider;
let g = 0.25;


function setup() {
  cnv = createCanvas(windowWidth, windowHeight/2);
  canvasX = cnv.width;
  canvasY = cnv.height;
  // an array to add multiple particles
  particles = [];

  // create sliders
  gravSlider = createSlider(0, 100, 25);
  gravSlider.position(20, 20);

}

function draw() {
  background('#0f0f0f');
  g = gravSlider.value() / 100;

  // Store mouse locations.
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
  this.p = new Particle();
  particles.push(this.p);
}

// function mousePressed() {
//   this.p = new Particle();
//   particles.push(this.p);
// }

let Particle = function() {

// setting the co-ordinates, radius and the
// speed of a particle in both the co-ordinates axes.
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

// creation of a particle.
Particle.prototype.createParticle = function() {
  noStroke();
  fill('rgba(200,169,169)');
  circle(this.pos.x,this.pos.y,this.r);
  }

Particle.prototype.updatePosition = function() {
  // Check collisions.
  this.checkCollision()

  // Calculate acceleration.
  this.accel = this.acceleration();

  // Calculate velocity.
  let velX = this.vel.x + this.accel.x * this.dt;
  let velY = this.vel.y + this.accel.y * this.dt;

  // Calculate position.
  let posX = this.pos.x + this.vel.x * this.dt;
  let posY = this.pos.y + this.vel.y * this.dt;

  // Update velocity and position.
  this.vel = createVector(velX, velY);
  this.pos = createVector(posX, posY);

  // Update lifespan.
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
  // Collision with boundary.
  if (this.pos.x >= canvasX & this.vel.x > 0) {
    this.vel.x = -this.vel.x * 0.75;
  } else if (this.pos.x <= 0 & this.vel.x < 0) {
    this.vel.x = -this.vel.x * 0.75;
  } else if (this.pos.y >= canvasY & this.vel.y > 0) {
    this.vel.y = -this.vel.y * 0.75;
  } else if (this.pos.y <= 0 & this.vel.y < 0) {
    this.vel.y = -this.vel.y * 0.75;
  }

  // Collisions with other particles.

}

Particle.prototype.acceleration = function() {
  if (this.pos.y < canvasY / 2) {
    accel = createVector(0, g);
  } else if (this.pos.y >= canvasY / 2) {
    accel = createVector(0, g);
  }
  return accel;
}
