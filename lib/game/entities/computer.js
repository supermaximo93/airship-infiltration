ig.module(
  'game.entities.computer'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityComputer = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/computer.png', 16, 24),

    size: { x: 16, y: 24 },
    maxHackHealth: 300,
    hackHealth: 300,
    regenHackHealthTimer: null,

    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
      this.regenHackHealthTimer = new ig.Timer();
    },

    check: function(other) {
      if (other instanceof EntityPlayer) {
        if (ig.input.state('hack')) {
          this.regenHackHealthTimer.reset();
          if (--this.hackHealth == 0) this.triggerHacked();
        }
      }
    },

    update: function() {
      if (this.hackHealth > 0 && this.regenHackHealthTimer.delta() > 1) {
        if (++this.hackHealth > this.maxHackHealth) this.hackHealth = this.maxHackHealth;
      }
      this.parent();
    },

    draw: function() {
      if (ig.game.font) ig.game.font.draw(this.hackHealth + '', this.pos.x, this.pos.y - 4, ig.Font.ALIGN.CENTER);
      this.parent();
    },

    triggerHacked: function() {
      for (var i in this.target) {
        var entity = ig.game.getEntityByName(this.target[i]);
        if (entity && entity.hackedTrigger) entity.hackedTrigger();
      }
    }
  });
});
