ig.module(
  'game.entities.turret'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityTurret = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/turret.png', 7, 7),
    turretParticleSheet: new ig.AnimationSheet('media/turret_particle.png', 3, 3),
    explosionSound: new ig.Sound('media/sounds/explosion.*'),

    size: { x: 7, y: 7 },
    hurtByPlayerBullet: true,
    gun: null,
    lengthOfSightSquared: 200 * 200,
    hitScanTimer: null,
    hitScanTimerInterval: 0.5,

    type: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
      if (ig.game.spawnEntity) {
        this.gun = ig.game.spawnEntity(EntityTurretGun, this.center().x, this.center().y, { parentTurret: this });
      }
      this.hitScanTimer = new ig.Timer();
    },

    afterInit: function() {
      for (var i in this.target) {
        var entity = ig.game.getEntityByName(this.target[i]);
        if (entity && entity.registerTrigger) {
          entity.registerTrigger();
        }
      }
    },

    receiveDamage: function(amount, from) {
      this.parent(amount, from);
      var center = this.center();
      EntityParticleEffect.create(center.x, center.y, { particleCount: 3 });
    },

    kill: function() {
      var center = this.center();
      EntityParticleEffect.create(center.x, center.y, {});
      EntityParticleEffect.create(center.x, center.y, {
        particle: {
          animSheet: this.turretParticleSheet,
          size: { x: 3, y: 3 },
          totalParticles: 3,
          lifetime: 5
        },
        particleCount: 6
      });

      if (this.gun) this.gun.kill();
      this.explosionSound.play();

      for (var i in this.target) {
        var entity = ig.game.getEntityByName(this.target[i]);
        if (entity) {
          if (entity.turretKilledTrigger) {
            entity.turretKilledTrigger();
          } else if (entity.genericTrigger) {
            entity.genericTrigger();
          }
        }
      }

      this.parent();
    },

    playerIsVisibleResult: false,
    playerIsVisible: function() {
      if (this.hitScanTimer.delta() > this.hitScanTimerInterval) {
        this.playerIsVisibleResult = ig.game.playerIsVisibleTo(this, false, false);
        this.hitScanTimer.reset();
      }
      return this.playerIsVisibleResult;
    }
  });

  EntityTurretGun = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/turret_gun.png', 9, 3),

    size: { x: 9, y: 3 },
    fireTimer: null,
    fireInterval: 2,
    parentTurret: null,
    gravityFactor: 0,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
      this.currentAnim.pivot = { x: 0, y: 1 }
      this.fireTimer = new ig.Timer();
    },

    update: function() {
      if (this.parentTurret && ig.game.player && this.parentTurret.playerIsVisible()) {
        var angle = this.angleTo(ig.game.player);
        this.currentAnim.angle = angle;

        if (this.fireTimer.delta() > this.fireInterval) {
          ig.game.spawnEntity(EntityTurretBullet, this.pos.x, this.pos.y, { parentTurretGun: this });
          this.fireTimer.reset();
        }
      }
      this.parent();
    }
  });

  EntityTurretBullet = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/turret_bullet.png', 3, 3),

    size: { x: 3, y: 3 },
    speed: 100,
    maxVel: { x: 200, y: 200 },
    gravityFactor: 0,
    damage: 2,
    parentTurretGun: null,

    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);

      var playerCenter = ig.game.player.center(), thisCenter = this.center();
      var direction = {
        x: playerCenter.x - thisCenter.x,
        y: playerCenter.y - thisCenter.y
      };
      var len = Math.sqrt((direction.x * direction.x) + (direction.y * direction.y));
      direction.x /= len;
      direction.y /= len;

      this.pos.x += direction.x * (this.parentTurretGun.size.x - 2);
      this.pos.y += direction.y * (this.parentTurretGun.size.x - 2);
      this.vel.x = direction.x * this.speed;
      this.vel.y = direction.y * this.speed;
    },

    handleMovementTrace: function(res) {
      this.parent(res);
      if (res.collision.x || res.collision.y) this.kill();
    },

    check: function(other) {
      if (other instanceof EntityPlayer) {
        other.receiveDamage(this.damage, this);
        this.kill();
      } else if (other.killsBullets) {
        this.kill();
      }
    }
  });
});
