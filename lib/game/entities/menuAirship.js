ig.module(
  'game.entities.menuAirship'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityMenuAirship = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/menu_airship.png', 30, 15),
    airshipParticleSheet: new ig.AnimationSheet('media/airship_particle.png', 2, 2),
    explosionSound: new ig.Sound('media/sounds/explosion.*'),

    size: { x: 30, y: 15 },
    vel: { x: 0, y: 0 },
    maxVel: { x: 20, y: 20 },
    gravityFactor: 0,
    exploding: false,
    explosionTimer: null,
    explosionTime: 8,

    type: ig.Entity.TYPE.B,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
    },

    update: function() {
      if (this.exploding) {
        if (this.explosionTimer && this.explosionTimer.delta() > this.explosionTime) ig.game.backToMenu();
        this.parent();
      }
    },

    explode: function() {
      this.exploding = true;
      this.gravityFactor = 1;
      this.vel.y = this.maxVel.y;
      this.vel.x = this.maxVel.x;
      this.createExplosion();
      this.explosionTimer = new ig.Timer();
    },

    createExplosion: function() {
      var x = Math.random().map(0, 1, 0, this.size.x);
      var y = Math.random().map(0, 1, 0, this.size.y);
      EntityParticleEffect.create(this.pos.x + x, this.pos.y + y, {
        particle: {
          animSheet: this.airshipParticleSheet,
          size: { x: 2, y: 2},
          lifetime: 0.6
        },
        lifetime: 0.25,
        callback: this.createExplosion.bind(this)
      });
      this.explosionSound.play();
    }
  });
});
