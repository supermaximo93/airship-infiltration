ig.module(
  'game.entities.switchDoor'
)
.requires(
  'impact.entity',
  'game.entities.door'
)
.defines(function() {
  EntitySwitchDoor = EntityDoor.extend({
    animSheet: new ig.AnimationSheet('media/switch_door.png', 5, 16),

    open: false,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.open = this.open === 'true';
      if (this.open) {
        this.openDoor();
      } else {
        this.closeDoor();
      }
      this.addAnim('on', 1, [0]);
      this.addAnim('off', 1, [1]);
      this.currentAnim = this.open ? this.anims.off : this.anims.on;
    },

    genericTrigger: function() {
      if (this.open) {
        this.closeDoor();
      } else {
        this.openDoor();
      }
    },

    openDoor: function() {
      this.open = true;
      this.collides = ig.Entity.COLLIDES.NEVER;
      this.type = ig.Entity.TYPE.NONE;
      this.currentAnim = this.anims.off;
      this.killsBullets = false;
      this.blocksHitScan = false;
    },

    closeDoor: function() {
      this.open = false;
      this.collides = ig.Entity.COLLIDES.FIXED;
      this.type = ig.Entity.TYPE.BOTH;
      this.currentAnim = this.anims.on;
      this.killsBullets = true;
      this.blocksHitScan = true;
    },

    registerTrigger: function() {}
  });
});
