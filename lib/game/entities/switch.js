ig.module(
  'game.entities.switch'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntitySwitch = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/switch.png', 9, 12),
    switchSound: new ig.Sound('media/sounds/switch.*'),

    size: { x: 9, y: 12 },
    on: false,

    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.on = this.on === 'true';
      this.addAnim('disengaged', 1, [0]);
      this.addAnim('engaged', 1, [1]);
      this.currentAnim = this.anims.disengaged;
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
      if (ig.game.font && this.playerIsNear()) {
        var text = 'Press C to ' + (this.on ? 'disengage' : 'engage');
        ig.game.font.bufferRelative(text, this.pos.x + this.size.x / 2, this.pos.y - 8, ig.Font.ALIGN.CENTER);
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

      this.switchSound.play();
    }
  });
});
