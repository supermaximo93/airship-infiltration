ig.module(
  'game.entities.gold'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityGold = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/gold.png', 10, 10),

    size: { x: 10, y: 10 },
    maxVel: { x: 0, y: 150 },

    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
    },

    check: function(other) {
      if (other instanceof EntityPlayer) {
        other.gold += (this.value || 1);
        this.kill();
      }
    }
  });
});
