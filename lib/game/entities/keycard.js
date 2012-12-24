ig.module(
  'game.entities.keycard'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityKeycard = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/keycard.png', 8, 8),

    size: { x: 8, y: 8 },
    friction: { x: 100, y: 0 },
    bounciness: 0.6,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
    },

    check: function(other) {
      if (other instanceof EntityPlayer) {
        other.keycards++;
        this.kill();
      }
    }
  });
});
