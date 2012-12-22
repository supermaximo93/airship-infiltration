ig.module(
  'game.entities.door'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityDoor = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/door.png', 5, 16),

    size: { x: 5, y: 16 },
    killsBullets: true,
    type: ig.Entity.TYPE.BOTH,
    collides: ig.Entity.COLLIDES.FIXED,
    triggerCount: null,
    _triggerCount: 0,
    blocksHitScan: true,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('on', 1, [0]);
      this.addAnim('off', 1, [1]);
      this.currentAnim = this.anims.on;
    },

    genericTrigger: function() {
      if (--this._triggerCount <= 0) {
        this.collides = ig.Entity.COLLIDES.NEVER;
        this.type = ig.Entity.TYPE.NONE;
        this.currentAnim = this.anims.off;
        this.killsBullets = false;
        this.blocksHitScan = false;
      }
    },

    registerTrigger: function() {
      this._triggerCount++;
      if (this.triggerCount !== null && this._triggerCount > this.triggerCount) this._triggerCount = this.triggerCount;
    }
  });
});
