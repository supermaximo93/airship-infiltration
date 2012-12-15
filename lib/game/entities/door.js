ig.module(
  'game.entities.door'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityDoor = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/door.png', 3, 16),

    size: { x: 3, y: 16 },
    killsBullets: true,
    type: ig.Entity.TYPE.BOTH,
    collides: ig.Entity.COLLIDES.FIXED,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('on', 1, [0]);
      this.addAnim('off', 1, [1]);
      this.currentAnim = this.anims.on;
    },

    powersupplyKilledTrigger: function() {
      this.collides = ig.Entity.COLLIDES.NEVER;
      this.currentAnim = this.anims.off;
      this.killsPlayerBullets = false;
    }
  });
});
