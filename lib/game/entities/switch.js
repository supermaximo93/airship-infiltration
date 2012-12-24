ig.module(
  'game.entities.switch'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntitySwitch = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/computer.png', 16, 24),

    size: { x: 16, y: 24 },
    on: false,

    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.on = this.on === 'true';
      this.addAnim('disengaged', 0.4, [0, 1, 2, 3, 2, 1]);
      this.addAnim('engaged', 0.4, [4, 5, 6, 7, 6, 5]);
      this.currentAnim = this.anims.disengaged;
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
        if (ig.input.pressed('action')) this.triggerEngaged();
      }
    },

    draw: function() {
      if (ig.game.font) {
        var text = 'Press C to ' + (this.on ? 'disengage' : 'engage');
        ig.game.font.drawRelative(text, this.pos.x + this.size.x / 2, this.pos.y - 8, ig.Font.ALIGN.CENTER);
      }
      this.parent();
    },

    triggerEngaged: function() {
      if (this.on) {
        this.on = false;
        this.currentAnim = this.anims.disengaged;
      } else {
        this.on = true;
        this.currentAnim = this.anims.engaged;
      }

      for (var i in this.target) {
        var entity = ig.game.getEntityByName(this.target[i]);
        if (entity) {
          if (!this.on && entity.switchEngagedTrigger) {
            entity.switchEngagedTrigger();
          } else if (this.on && entity.switchDisengagedTrigger) {
            entity.switchDisengagedTrigger();
          } else if (entity.genericTrigger) {
            entity.genericTrigger();
          }
        }
      }
    }
  });
});
