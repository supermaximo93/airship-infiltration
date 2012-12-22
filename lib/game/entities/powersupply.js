ig.module(
  'game.entities.powersupply'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityPowersupply = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/powersupply.png', 16, 16),
    turretParticleSheet: new ig.AnimationSheet('media/turret_particle.png', 3, 3),
    explosionSound: new ig.Sound('media/sounds/explosion.*'),

    size: { x: 16, y: 16 },
    health: 30,
    hurtByPlayerBullet: true,

    type: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 0.4, [0, 1, 2, 3, 4]);
    },

    afterInit: function() {
      for (var i in this.target) {
        var entity = ig.game.getEntityByName(this.target[i]);
        if (entity && entity.registerTrigger) {
          entity.registerTrigger();
        }
      }
    },

    receiveDamage: function(amount, from) {
      this.parent(amount, from);
      var center = this.center();
      EntityParticleEffect.create(center.x, center.y, { particleCount: 3 });
    },

    kill: function() {
      for (var i in this.target) {
        var entity = ig.game.getEntityByName(this.target[i]);
        if (entity) {
          if (entity.powersupplyKilledTrigger) {
            entity.powersupplyKilledTrigger();
          } else if (entity.genericTrigger) {
            entity.genericTrigger();
          }
        }
      }

      var center = this.center();
      EntityParticleEffect.create(center.x, center.y, {});
      EntityParticleEffect.create(center.x, center.y, {
        particle: {
          animSheet: this.turretParticleSheet,
          size: { x: 3, y: 3 },
          totalParticles: 3,
          lifetime: 5
        },
        particleCount: 10
      });
      
      this.explosionSound.play();

      this.parent();
    }
  });
});
