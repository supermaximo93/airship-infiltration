ig.module(
  'game.entities.guard'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityGuard = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/player.png', 8, 14),

    size: { x: 8, y: 14 },
    offset: { x: 0, y: 0 },
    flip: false,

    maxVel: { x: 100, y: 150 },
    normalSpeed: 60,
    alertSpeed: 100,
    alerted: false,
    xFriction: { ground: 800, air: 75 },
    friction: { x: 800, y: 0 },
    accelGround: 500,
    accelAir: 300,
    jump: 200,
    lengthOfSightSquared: 120 * 120,
    fireTimer: null,
    fireInterval: 1,
    hurtByPlayerBullet: true,

    type: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
      this.fireTimer = new ig.Timer();
    },

    update: function() {
      if (this.alerted) {
        var player = ig.game.player;
        if (player) {
          if (player.pos.x < this.pos.x) {
            this.flip = true;
            if (player.pos.x + player.size.x * 2 < this.pos.x) this.vel.x = -this.alertSpeed;
          } else {
            this.flip = false;
            if (player.pos.x - player.size.x > this.pos.x + this.size.x) this.vel.x = this.alertSpeed;
          }
          this.alerted = this.playerIsVisible();

          if (this.onFloorEdge()) {
            this.vel.x = 0;
            if (!this.alerted) this.flip = !this.flip;
          }

          if (this.fireTimer.delta() > this.fireInterval) {
            ig.game.spawnEntity(EntityGuardBullet, this.pos.x, this.pos.y + 5, { flip: this.flip });
            this.fireTimer.reset();
          }
        } else {
          this.alerted = false;
        }
      } else if (this.playerIsVisible()) {
        this.alerted = true;
      } else {
        if (this.onFloorEdge()) this.flip = !this.flip;
        this.vel.x = this.flip ? -this.normalSpeed : this.normalSpeed;
        this.currentAnim.flip.x = this.flip;
      }

      this.parent();
    },

    handleMovementTrace: function(res) {
      this.parent(res);
      if (res.collision.x) this.flip = !this.flip;
    },

    playerIsVisible: function() {
      var playerVisible = false;
      if (ig.game.player) {
        var player = ig.game.player;

        var thisCenter = { x: this.pos.x + this.size.x / 2, y: this.pos.y + this.size.y / 2 },
          playerCenter = { x: player.pos.x + player.size.x / 2, y: player.pos.y + player.size.y / 2 };

        var xd = playerCenter.x - thisCenter.x,
            yd = playerCenter.y - thisCenter.y;

        if ((this.flip && xd > 0) || (!this.flip && xd < 0)) return false;
        
        var distanceToPlayerSquared = (xd * xd) + (yd * yd);

        if (distanceToPlayerSquared <= this.lengthOfSightSquared) {
          result = ig.game.collisionMap.trace(thisCenter.x, thisCenter.y, xd, yd, 1, 1);
          return !result.collision.x && !result.collision.y;
        }
      }
      return playerVisible;
    },

    onFloorEdge: function() {
      return !ig.game.collisionMap.getTile(this.pos.x + (this.flip ? -1 : this.size.x + 1), this.pos.y + this.size.y + 1);
    }
  });

  EntityGuardBullet = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/player_bullet.png', 5, 3),

    size: { x: 5, y: 3 },
    flip: false,
    maxVel: { x: 200, y: 0 },

    damage: 3,

    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.vel.x = this.flip ? -this.maxVel.x : this.maxVel.x;
      this.addAnim('idle', 1, [0]);
    },

    handleMovementTrace: function(res) {
      this.parent(res);
      if (res.collision.x || res.collision.y) this.kill();
    },

    check: function(other) {
      if (other instanceof EntityPlayer) {
        other.receiveDamage(this.damage, this);
        this.kill();
      }
    }
  });

});
