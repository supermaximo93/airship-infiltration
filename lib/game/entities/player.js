ig.module(
  'game.entities.player'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityPlayer = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/player.png', 8, 14),

    size: { x: 8, y: 14 },
    offset: { x: 0, y: 0 },
    flip: false,

    maxVel: { x: 100, y: 150 },
    xFriction: { ground: 800, air: 75 },
    friction: { x: 800, y: 0 },
    accelGround: 500,
    accelAir: 300,
    jump: 200,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
    },

    update: function() {
      var acceleration;
      if (this.standing) {
        acceleration = this.accelGround;
        this.friction.x = this.xFriction.ground;
      } else {
        acceleration = this.accelAir;
        this.friction.x = this.xFriction.air;
      }

      var moveLeft = ig.input.state('left'), moveRight = ig.input.state('right');
      if ((moveLeft || moveRight) && !(moveLeft && moveRight)) {
        if (moveLeft) {
          this.accel.x = -acceleration;
          this.flip = true;
        }
        if (moveRight) {
          this.accel.x = acceleration;
          this.flip = false
        }
      } else {
        this.accel.x = 0;
      }

      if (this.standing && ig.input.pressed('jump')) this.vel.y = -this.jump;

      if (ig.input.pressed('fire')) ig.game.spawnEntity(EntityPlayerBullet, this.pos.x, this.pos.y + 5, { flip: this.flip })

      this.parent();
    }
  });

  EntityPlayerBullet = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/player_bullet.png', 5, 3),

    size: { x: 5, y: 3 },
    flip: false,

    maxVel: { x: 200, y: 0 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.vel.x = this.flip ? -this.maxVel.x : this.maxVel.x;
      this.addAnim('idle', 1, [0]);
    },

    handleMovementTrace: function(res) {
      this.parent(res);
      if (res.collision.x || res.collision.y) this.kill();
    }
  });
});
