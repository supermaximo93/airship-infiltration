ig.module(
  'game.entities.boss'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityBoss = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/boss_body.png', 72, 72),
    particleSheet: new ig.AnimationSheet('media/turret_particle.png', 3, 3),
    introSound: new ig.Sound('media/sounds/boss_intro.*'),
    explosionSound: new ig.Sound('media/sounds/explosion.*'),

    size: { x: 50, y: 72 },
    offset: { x: 11, y: 0 },
    maxVel: { x: 0, y: 100 },
    health: 200,
    gravityFactor: 0,

    angry: false,
    hurt: false,

    hurtByPlayerBullet: true,
    hurtTimer: null,
    hurtTime: 0.1,

    STATES: {
      ATTACK1: 0,
      ATTACK2: 1,
      IDLE: 2
    },

    Y_POSITIONS: {
      0: 140,
      1: 240,
      2: 200
    },

    currentState: null,
    nextState: null,
    stateTimer: null,
    stateChangeInterval: 3,
    gun: null,

    inactive: true,
    doorToLock: '',

    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.FIXED,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
      this.addAnim('angry', 0.1, [1, 0]);
      this.addAnim('idleHurt', 1, [2]);
      this.addAnim('angryHurt', 0.1, [3, 2]);
      this.currentAnim = this.anims.idle;
      this.currentAnim.alpha = 0;
      this.hurtTimer = new ig.Timer();
      this.currentState = this.STATES.IDLE;
      this.stateTimer = new ig.Timer();
      if (ig.game && ig.game.spawnEntity) this.gun = ig.game.spawnEntity(EntityBossGun, x, y, { parentBoss: this });
      this.introSound.volume = 0.5;
    },

    afterInit: function() {
      for (var i in this.target) {
        var entity = ig.game.getEntityByName(this.target[i]);
        if (entity && entity.registerTrigger) {
          entity.registerTrigger();
        }
      }
    },

    update: function() {
      if (this.inactive) return;

      if (this.health <= 0) {
        if (this.currentAnim.alpha == 0) {
          this.kill();
        } else {
          this.currentAnim.alpha -= this.stateTimer.delta() / 5.0;
          if (this.currentAnim.alpha < 0) this.currentAnim.alpha = 0;
        }
        this.stateTimer.reset();
        return;
      }

      if (this.currentAnim.alpha < 1) {
        this.currentAnim.alpha += this.stateTimer.delta() / 5.0;
        if (this.currentAnim.alpha > 1) {
          this.currentAnim.alpha = 1;
          ig.music.play('boss');
          this.nextState = Math.round(Math.random());
        }
        this.stateTimer.reset();
        return;
      }

      if (this.hurt && this.hurtTimer.delta() > this.hurtTime) {
        this.hurt = false;
        this.currentAnim = this.angry ? this.anims.angry : this.anims.idle;
      }

      if (this.nextState === null) {
        this.dealWithState();
      } else {
        this.stateTransition();
      }

      this.parent();
    },

    check: function(other) {
      if (other instanceof EntityPlayer && this.currentAnim.alpha == 1) {
        other.receiveDamage(1, this);
      }
    },

    receiveDamage: function(amount, from) {
      if (this.currentAnim.alpha < 1) return;

      this.hurt = true;
      this.hurtTimer.reset();
      this.currentAnim = this.angry ? this.anims.angryHurt : this.anims.idleHurt;
      if (this.health > 0) {
        this.health -= amount;
        if (this.health <= 0) {
          this.collides = ig.Entity.COLLIDES.NONE;
          this.createExplosion();
          this.stateTimer.reset();
        }
      }
    },

    kill: function() {
      for (var i in this.target) {
        var entity = ig.game.getEntityByName(this.target[i]);
        if (entity) {
          if (entity.bossKilledTrigger) {
            entity.bossKilledTrigger();
          } else if (entity.genericTrigger) {
            entity.genericTrigger();
          }
        }
      }
      this.gun.kill();
      this.parent();
      ig.music.fadeOut(3);
    },

    genericTrigger: function() {
      var entity = ig.game.getEntityByName(this.doorToLock);
      if (entity && entity.genericTrigger) entity.genericTrigger();
      this.inactive = false;
      this.stateTimer.reset();
      ig.music.fadeOut(3);
      this.introSound.play();
    },

    dealWithState: function() {
      switch (this.currentState) {
      case this.STATES.IDLE:
        if (this.stateTimer.delta() > this.stateChangeInterval) this.nextState = Math.round(Math.random());
        break;

      case this.STATES.ATTACK1:
      case this.STATES.ATTACK2:
        this.stateTimer.reset();
        if (!this.gun.attacking) {
          var boss = this;
          this.gun.attack(function() {
            boss.nextState = boss.STATES.IDLE;
          });
        }
        break;
      }
    },

    stateTransition: function() {
      if (!this.angry) {
        this.angry = true;
        this.currentAnim = this.hurt ? this.anims.angryHurt : this.anims.angry;
      }

      this.stateTimer.reset();

      var destY = this.Y_POSITIONS[this.nextState], tolerance = 2;
      if (destY < this.pos.y + tolerance && destY > this.pos.y - tolerance) {
        this.pos.y = destY;
        this.vel.y = 0;
        this.currentState = this.nextState;
        this.nextState = null;
        this.angry = false;
        this.currentAnim = this.hurt ? this.anims.idleHurt : this.anims.idle;
      } else {
        this.vel.y = this.pos.y < destY ? this.maxVel.y : -this.maxVel.y;
      }
    },

    createExplosion: function() {
      if (this.currentAnim.alpha <= 0) return;

      var x = Math.random().map(0, 1, 0, this.size.x);
      var y = Math.random().map(0, 1, 0, this.size.y);
      EntityParticleEffect.create(this.pos.x + x, this.pos.y + y, {
        particle: {
          lifetime: 0.6
        },
        lifetime: 0.1,
        callback: this.createExplosion.bind(this)
      });
      EntityParticleEffect.create(this.pos.x + x, this.pos.y + y, {
        particle: {
          animSheet: this.particleSheet,
          size: { x: 3, y: 3 },
          lifetime: 0.6
        },
        lifetime: 0.25
      });
      this.explosionSound.play();
    }
  });

  EntityBossGun = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/boss_gun.png', 64, 17),
    bulletParticleSheet: new ig.AnimationSheet('media/turret_particle.png', 3, 3),
    explosionSound: new ig.Sound('media/sounds/explosion.*'),

    size: { x: 64, y: 17 },

    parentBoss: null,
    deltaTimer: null,
    fireTimer: null,
    fireInterval: 0.1,
    attackTimer: null,
    attackTime: 4,
    attacking: false,
    attackCallback: null,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
      this.currentAnim.pivot = { x: 0, y: 9 };
      this.deltaTimer = new ig.Timer();
      this.fireTimer = new ig.Timer();
      this.attackTimer = new ig.Timer();
      this.explosionSound.volume = 0.3;
    },

    update: function() {
      if (this.parentBoss) {
        var center = this.parentBoss.center();
        this.pos.x = center.x;
        this.pos.y = center.y - this.size.y / 2;

        this.currentAnim.alpha = this.parentBoss.currentAnim.alpha;

        if (this.parentBoss.health <= 0) this.attacking = false;
      }

      if (this.attacking) {
        this.currentAnim.angle += this.deltaTimer.delta() * 3;

        if (this.fireTimer.delta() > this.fireInterval) {
          this.fire();
          this.fireTimer.reset();
        }

        if (this.attackTimer.delta() > this.attackTime) {
          if (this.attackCallback) this.attackCallback();
          this.attackCallback = null;
          this.attacking = false;
        }
      }

      this.deltaTimer.reset();
      this.parent();
    },

    kill: function() {
      this.parentBoss = null;
      this.parent();
    },

    attack: function(callback) {
      this.attacking = true;
      this.attackCallback = callback;
      this.attackTimer.reset();
    },

    fire: function() {
      ig.game.spawnEntity(EntityBossBullet, this.pos.x, this.pos.y, { parentBossGun: this });
    }
  });

  EntityBossBullet = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/boss_bullet.png', 7, 7),

    size: { x: 7, y: 7 },
    speed: 200,
    maxVel: { x: 400, y: 400 },
    gravityFactor: 0,
    damage: 9,
    parentBossGun: null,

    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);

      var angle = this.parentBossGun.currentAnim.angle;
      var direction = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      };

      this.pos.x += direction.x * (this.parentBossGun.size.x);
      this.pos.y += direction.y * (this.parentBossGun.size.x);
      this.vel.x = direction.x * this.speed;
      this.vel.y = direction.y * this.speed;
    },

    update: function() {
      this.parent();
      if (this.pos.y > 350) this.kill();
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
    },

    kill: function() {
      if (this.pos.y < 350) {
        var center = this.center();
        EntityParticleEffect.create(center.x, center.y, {});
        EntityParticleEffect.create(center.x, center.y, {
          particle: {
            animSheet: this.parentBossGun.bulletParticleSheet,
            size: { x: 3, y: 3 },
            totalParticles: 3,
            lifetime: 1
          },
          particleCount: 6
        });

        this.parentBossGun.explosionSound.play();
      }

      this.parent();
    }
  });
});
