ig.module(
  'game.entities.turret'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityTurret = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/turret.png', 7, 7),

    size: { x: 7, y: 7 },
    hurtByPlayerBullet: true,
    gun: null,

    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
      if (ig.game.spawnEntity) {
        gun = ig.game.spawnEntity(EntityTurretGun, x + this.size.x / 2, y + this.size.y / 2, {});
      }
    },

    kill: function() {
      if (gun) gun.kill();
      this.parent();
    }
  });

  EntityTurretGun = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/turret_gun.png', 9, 3),

    size: { x: 9, y: 3 },
    fireTimer: null,
    fireInterval: 2,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
      this.currentAnim.pivot = { x: 0, y: 1 }
      this.fireTimer = new ig.Timer();
    },

    update: function() {
      if (ig.game.player) {
        var angle = this.angleTo(ig.game.player);
        this.currentAnim.angle = angle;

        if (this.fireTimer.delta() > this.fireInterval) {
          ig.game.spawnEntity(EntityTurretBullet, this.pos.x, this.pos.y, { angle: angle });
          this.fireTimer.reset();
        }
      }
    }
  });

  EntityTurretBullet = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/turret_bullet.png', 3, 3),

    size: { x: 3, y: 3 },
    speed: 200,
    gravityFactor: 0,
    damage: 2,

    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);

      this.vel.x = Math.cos(settings.angle) * this.speed;
      this.vel.y = Math.sin(settings.angle) * this.speed;
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
