ig.module(
  'game.entities.menuPlayer'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityMenuPlayer = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/menu_player.png', 1, 1),

    size: { x: 1, y: 1 },
    maxVel: { x: 10, y: 15 },

    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
    },

    check: function(other) {
      if (other instanceof EntityMenuAirship && !other.exploding && ig.game.startGame) ig.game.startGame();
    },

    go: function() {
      this.vel.x = this.maxVel.x;
    }
  });
});
