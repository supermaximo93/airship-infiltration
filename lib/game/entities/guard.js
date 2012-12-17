ig.module(
  'game.entities.guard'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityGuard = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/guard.png', 16, 16),
    shootSound: new ig.Sound('media/sounds/guard_shoot.*'),
    hurtSound: new ig.Sound('media/sounds/hurt.*'),
    dieSound: new ig.Sound('media/sounds/die.*'),

    size: { x: 8, y: 14 },
    offset: { x: 4, y: 2 },
    flip: false,

    maxVel: { x: 100, y: 150 },
    normalSpeed: 50,
    alertSpeed: 100,
    alerted: false,
    alertedTimer: null,
    alertedFadeTime: 2,
    xFriction: { ground: 800, air: 75 },
    friction: { x: 800, y: 0 },
    accelGround: 500,
    accelAir: 300,
    jump: 200,
    lengthOfSightSquared: 120 * 120,
    fireTimer: null,
    fireInterval: 1,
    hurtByPlayerBullet: true,
    emote: null,
    emoteTimer: null,
    emoteTime: 2,

    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.BOTH,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
      this.addAnim('run', 0.14, [0, 1, 2, 3, 4, 5]);
      this.addAnim('jump', 1, [9]);
      this.addAnim('fall', 0.4, [6, 7]);
      this.addAnim('alert', 0.07, [0, 1, 2, 3, 4, 5]);

      this.fireTimer = new ig.Timer();
      this.alertedTimer = new ig.Timer();
      this.emoteTimer = new ig.Timer();
    },

    update: function() {
      if (this.alerted) {
        var player = ig.game.player;
        if (player) {
          this.setEmote('!');
          if (player.pos.x < this.pos.x) {
            this.flip = true;
            if (player.pos.x + player.size.x * 2 < this.pos.x) this.vel.x = -this.alertSpeed;
          } else {
            this.flip = false;
            if (player.pos.x - player.size.x > this.pos.x + this.size.x) this.vel.x = this.alertSpeed;
          }
          if (this.onFloorEdge()) this.vel.x = 0;

          if (this.playerIsVisible()) {
            this.alertedTimer.reset();

            if (this.fireTimer.delta() > this.fireInterval) {
              ig.game.spawnEntity(EntityGuardBullet, this.pos.x + (this.flip ? -2 : this.size.x - this.offset.x + 2), this.pos.y + 8, { flip: this.flip });
              this.fireTimer.reset();
              this.shootSound.play();
            }
          }
        } else {
          this.setEmote(';D');
          this.alerted = false;
        }
        if (this.alertedTimer.delta() > this.alertedFadeTime) {
          this.emote = null;
          this.alerted = false;
        }
      } else if (this.playerIsVisible()) {
        this.alerted = true;
      } else {
        if (this.onFloorEdge()) this.flip = !this.flip;
        this.vel.x = this.flip ? -this.normalSpeed : this.normalSpeed;
        this.currentAnim.flip.x = this.flip;
      }

      if (this.vel.y < 0) {
        this.currentAnim = this.anims.jump;
      } else if (this.vel.y > 0) {
        this.currentAnim = this.anims.fall;
      } else if (this.vel.x != 0) {
        this.currentAnim = this.alerted ? this.anims.alert : this.anims.run;
      } else {
        this.currentAnim = this.anims.idle;
      }
      this.currentAnim.flip.x = this.flip;

      if (this.emoteTimer.delta() > this.emoteTime) this.emote = null;

      this.parent();
    },

    handleMovementTrace: function(res) {
      this.parent(res);
      if (res.collision.x) this.flip = !this.flip;
    },

    receiveDamage: function(amount, from) {
      this.parent(amount, from);
      EntityParticleEffect.create(this.center().x, this.center().y, {
        particle: {
          animSheet: new ig.AnimationSheet('media/blood_particle.png', 2, 2),
          totalParticles: 5,
          lifetime: 0.5
        },
        particleCount: 3
      });
      this.hurtSound.play();
    },

    kill: function() {
      EntityParticleEffect.create(this.center().x, this.center().y, {
        particle: {
          animSheet: new ig.AnimationSheet('media/blood_particle.png', 2, 2),
          totalParticles: 5,
          lifetime: 1.5,
          friction: { x: 100, y: 20 }
        }
      });

      for (var i in this.target) {
        var entity = ig.game.getEntityByName(this.target[i]);
        if (entity) {
          if (entity.guardKilledTrigger) {
            entity.guardKilledTrigger();
          } else if (entity.genericTrigger) {
            entity.genericTrigger();
          }
        }
      }

      this.dieSound.play();
      this.parent();
    },

    draw: function() {
      if (this.emote) ig.game.font.drawRelative(this.emote, this.center().x, this.pos.y - 8, ig.Font.ALIGN.CENTER);
      this.parent();
    },

    check: function(other) {
      if (other instanceof EntityDoor) {
        this.flip = !this.flip;
      }
    },

    playerIsVisible: function() {
      return ig.game.playerIsVisibleTo(this, true, true);
    },

    onFloorEdge: function() {
      return !ig.game.collisionMap.getTile(this.pos.x + (this.flip ? -1 : this.size.x + 1), this.pos.y + this.size.y + 1);
    },

    setEmote: function(emote) {
      this.emote = emote;
      this.emoteTimer.reset();
    }
  });

  EntityGuardBullet = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/player_bullet.png', 3, 2),

    size: { x: 3, y: 2 },
    flip: false,
    maxVel: { x: 200, y: 0 },

    damage: 3,

    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.vel.x = this.flip ? -this.maxVel.x : this.maxVel.x;
      this.addAnim('idle', 1, [0]);
      this.currentAnim.flip.x = this.flip;
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
