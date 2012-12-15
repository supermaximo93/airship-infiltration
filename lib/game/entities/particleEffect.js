ig.module(
  'game.entities.particleEffect'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityParticleEffect = ig.Entity.extend({
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(255, 0, 0, 0.7)',

    size: { x: 10, y: 10 },
    lifetime: 1,
    callback: null,
    particleCount: 10,
    timer: null,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      if (!ig.game.spawnEntity) return;
      
      for (var i = 0; i < this.particleCount; i++) {
        var particleSettings = { lifetime: this.lifetime };
        if (settings.particle && typeof(settings.particle) == 'object') {
          for (var key in settings.particle) {
            particleSettings[key] = settings.particle[key];
          }
        }
        ig.game.spawnEntity(EntityParticleEffectParticle, this.pos.x, this.pos.y, particleSettings);
      }
      this.timer = new ig.Timer();
    },

    update: function() {
      if (this.timer.delta() > this.lifetime) {
        if (this.callback) this.callback();
        this.kill();
        return;
      }
    }
  });

  EntityParticleEffectParticle = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/particle.png', 1, 1),

    size: { x: 1, y: 1 },
    maxVel: { x: 160, y: 200 },
    lifetime: 1,
    fadetime: 1,
    bounciness: 0.3,
    vel: { x: 40, y: 50 },
    friction: { x: 20, y: 20 },
    timer: null,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.vel.x = (Math.random() * 4 - 1) * this.vel.x;
      this.vel.y = (Math.random() * 10 - 1) * this.vel.y;
      this.timer = new ig.Timer();
      this.addAnim('idle', 1, [0]);
    },

    update: function() {
      if (this.timer.delta() > this.lifetime) {
        this.kill();
        return;
      }
      this.currentAnim.alpha = this.timer.delta().map(this.lifetime - this.fadetime, this.lifetime, 1, 0);
      this.parent();
    }
  });
});
