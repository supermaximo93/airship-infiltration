ig.module(
  'game.entities.checkpoint'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityCheckpoint = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/checkpoint.png', 5, 16),

    size: { x: 5, y: 16 },
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,
    on: false,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('off', 1, [0]);
      this.addAnim('on', 1, [1]);
      this.currentAnim = this.on ? this.anims.on : this.anims.off;
    },

    check: function(other) {
      if (other instanceof EntityPlayer && !this.on) {
        var checkpoints = ig.game.getEntitiesByType(EntityCheckpoint);
        for (var i = 0; i < checkpoints.length; i++) {
          checkpoints[i].turnOff();
        }
        this.turnOn();
      }
    },

    turnOn: function() {
      ig.game.goalManager.spawnPoint.x = this.pos.x;
      ig.game.goalManager.spawnPoint.y = this.pos.y;
      this.on = true;
      this.currentAnim = this.anims.on;
    },

    turnOff: function() {
      this.on = false;
      this.currentAnim = this.anims.off;
    }
  });
});
