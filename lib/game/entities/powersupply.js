ig.module(
  'game.entities.powersupply'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityPowersupply = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/powersupply.png', 16, 16),

    size: { x: 16, y: 16 },
    health: 30,
    hurtByPlayerBullet: true,

    type: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
    },

    kill: function() {
      for (var i in this.target) {
        var entity = ig.game.getEntityByName(this.target[i]);
        if (entity && entity.powersupplyKilledTrigger) entity.powersupplyKilledTrigger();
      }
      this.parent();
    }
  });
});
