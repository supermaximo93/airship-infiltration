ig.module(
  'game.entities.computer'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityComputer = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/computer.png', 16, 24),
    hackedSound: new ig.Sound('media/sounds/hacked.*'),

    size: { x: 16, y: 24 },
    maxHackHealth: 150,
    hackHealth: 150,
    regenHackHealthTimer: null,

    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 0.4, [0, 1, 2, 3, 2, 1]);
      this.addAnim('hacked', 0.4, [4, 5, 6, 7, 6, 5]);
      this.currentAnim = this.anims.idle;
      this.regenHackHealthTimer = new ig.Timer();
    },

    afterInit: function() {
      for (var i in this.target) {
        var entity = ig.game.getEntityByName(this.target[i]);
        if (entity && entity.registerTrigger) {
          entity.registerTrigger();
        }
      }
    },

    check: function(other) {
      if (other instanceof EntityPlayer) {
        if (ig.input.state('action')) {
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
      if (ig.game.font && this.playerIsNear()) {
        var text = this.hackHealth < 0 ? ';D' : (this.hackHealth >= this.maxHackHealth ? 'Press C to hack' : this.hackHealth + '');
        ig.game.font.bufferRelative(text, this.pos.x + this.size.x / 2, this.pos.y - 8, ig.Font.ALIGN.CENTER);
      }
      this.parent();
    },

    triggerHacked: function() {
      this.currentAnim = this.anims.hacked;
      for (var i in this.target) {
        var entity = ig.game.getEntityByName(this.target[i]);
        if (entity) {
          if (entity.computerHackedTrigger) {
            entity.computerHackedTrigger();
          } else if (entity.genericTrigger) {
            entity.genericTrigger();
          }
        }
      }
      this.hackedSound.play();
    }
  });
});
