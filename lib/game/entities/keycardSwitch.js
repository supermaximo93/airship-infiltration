ig.module(
  'game.entities.keycardSwitch'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityKeycardSwitch = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/keycard_switch.png', 10, 12),

    size: { x: 10, y: 12 },
    engaged: false,

    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
      this.addAnim('engaged', 1, [1]);
      this.currentAnim = this.anims.idle;
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
        if (!this.engaged && ig.input.pressed('action') && other.keycards > 0) {
          other.keycards--;
          this.triggerEngaged();
        }
      }
    },

    draw: function() {
      var player = ig.game.player;
      if (ig.game.font && player) {
        var text = this.engaged ? ';D' : (player.keycards > 0 ? 'Press C to use keycard' : 'You have 0 keycards :(');
        ig.game.font.drawRelative(text, this.pos.x + this.size.x / 2, this.pos.y - 8, ig.Font.ALIGN.CENTER);
      }
      this.parent();
    },

    triggerEngaged: function() {
      this.engaged = true;
      this.currentAnim = this.anims.engaged;
      for (var i in this.target) {
        var entity = ig.game.getEntityByName(this.target[i]);
        if (entity) {
          if (entity.keycardSwitchEngagedTrigger) {
            entity.keycardSwitchEngagedTrigger();
          } else if (entity.genericTrigger) {
            entity.genericTrigger();
          }
        }
      }
    }
  });
});
