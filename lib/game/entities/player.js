ig.module(
  'game.entities.player'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityPlayer = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/player.png', 16, 16),
    bloodParticleSheet: new ig.AnimationSheet('media/blood_particle.png', 2, 2),
    jumpSound: new ig.Sound('media/sounds/jump.*'),
    shootSound: new ig.Sound('media/sounds/player_shoot.*'),
    hurtSound: new ig.Sound('media/sounds/hurt.*'),
    dieSound: new ig.Sound('media/sounds/die.*'),

    size: { x: 8, y: 14 },
    offset: { x: 4, y: 2 },
    flip: false,

    maxVel: { x: 100, y: 150 },
    xFriction: { ground: 800, air: 75 },
    friction: { x: 800, y: 0 },
    accelGround: 500,
    accelAir: 300,
    jump: 200,
    invincible: false,
    invincibilityTimer: null,
    invincibilityTime: 3,
    emote: null,
    emoteTimer: null,
    emoteTime: 2,
    isSneaky: false,

    keycards: 0,

    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.PASSIVE,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
      this.addAnim('run', 0.07, [0, 1, 2, 3, 4, 5]);
      this.addAnim('jump', 1, [9]);
      this.addAnim('fall', 0.4, [6, 7]);
      this.currentAnim = this.anims.idle;
      ig.game.player = this;
      if (this.invincible) this.invincibilityTimer = new ig.Timer();
      this.emoteTimer = new ig.Timer();
      this.afterInit();
    },

    afterInit: function() {
      if (ig.game.gameManager && ig.game.gameManager.spawnPoint === null) ig.game.gameManager.spawnPoint = { x: this.pos.x, y: this.pos.y };
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

      if (this.standing && ig.input.pressed('jump')) {
        this.vel.y = -this.jump;
        this.jumpSound.play();
      }

      if (ig.input.pressed('fire') && !ig.input.state('action')) {
        ig.game.spawnEntity(EntityPlayerBullet, this.pos.x + (this.flip ? -2 : this.size.x - this.offset.x + 2), this.pos.y + 8, { flip: this.flip });
        this.shootSound.play();
      }

      if (this.vel.y < 0) {
        this.currentAnim = this.anims.jump;
      } else if (this.vel.y > 0) {
        this.currentAnim = this.anims.fall;
      } else if (this.vel.x != 0) {
        this.currentAnim = this.anims.run;
      } else {
        this.currentAnim = this.anims.idle;
      }
      this.currentAnim.flip.x = this.flip;

      if (this.invincible) {
        if (this.invincibilityTimer.delta() > this.invincibilityTime) {
          this.invincible = false;
        } else {
          this.currentAnim.alpha = this.invincibilityTimer.delta().map(0, this.invincibilityTime, 0, 1);
        }
      } else {
        this.currentAnim.alpha = 1;
      }

      if (this.emoteTimer.delta() > this.emoteTime) {
        this.emote = null;
        if (this.isSneaky) this.isSneaky = false;
      }

      this.parent();
    },

    draw: function() {
      this.parent();
      if (!ig.game.font) return;

      if (this.emote) {
        ig.game.font.drawRelative(this.emote, this.center().x, this.pos.y - 8, ig.Font.ALIGN.CENTER);
      } else if (ig.input.state('action')) {
        ig.game.font.drawRelative('>:)', this.center().x, this.pos.y - 8, ig.Font.ALIGN.CENTER);
      } else if (this.invincible) {
        ig.game.font.drawRelative('B)', this.center().x, this.pos.y - 8, ig.Font.ALIGN.CENTER);
      }
    },

    receiveDamage: function(amount, from) {
      if (this.invincible) return;

      this.parent(amount, from);
      EntityParticleEffect.create(this.center().x, this.center().y, {
        particle: {
          animSheet: this.bloodParticleSheet,
          totalParticles: 5,
          lifetime: 0.5,
          friction: { x: 100, y: 20 }
        },
        particleCount: 3
      });
      this.hurtSound.play();

      if (this.isSneaky) {
        this.isSneaky = false;
        this.setEmote(':(');
      }
    },

    kill: function() {
      var callback = ig.game.gameManager ? ig.game.gameManager.playerDeathTrigger.bind(ig.game.gameManager) : null;

      EntityParticleEffect.create(this.center().x, this.center().y, {
        particle: {
          animSheet: this.bloodParticleSheet,
          totalParticles: 5,
          lifetime: 1.5
        },
        callback: callback
      });

      for (var i = 0; i < this.keycards; i++) {
        ig.game.spawnEntity(EntityKeycard, this.pos.x, this.pos.y, { vel: { x: (Math.random() - 0.5) * 200, y: 0 } });
      }

      this.dieSound.play();
      this.parent();

      ig.game.player = null;
    },

    setEmote: function(emote) {
      this.emote = emote;
      this.emoteTimer.reset();
    },

    sneaky: function() {
      this.setEmote(';)');
      this.isSneaky = true;
    }
  });

  EntityPlayerBullet = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/player_bullet.png', 3, 2),

    size: { x: 3, y: 2 },
    flip: false,
    maxVel: { x: 200, y: 0 },

    damage: 3,

    checkAgainst: ig.Entity.TYPE.B,
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
      if (other.hurtByPlayerBullet) {
        other.receiveDamage(this.damage, this);
        this.kill();
      } else if (other.killsBullets) {
        this.kill();
      }
    }
  });
});
