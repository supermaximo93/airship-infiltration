ig.module( 
  'game.main'
)
.requires(
  'impact.game',
  'impact.font',

  'game.entities.particleEffect',

  'game.levels.menu',
  'game.levels.ending',
  'game.levels.level1',
  'game.levels.level2',
  'game.levels.level3'
)
.defines(function(){

ig.Entity.inject({
  afterInit: function() {},

  center: function() {
    return { x: this.pos.x + this.size.x / 2, y: this.pos.y + this.size.y / 2 };
  },

  collisionAtPoint: function(x, y) {
    return (x >= this.pos.x) && (x <= this.pos.x + this.size.x) && (y >= this.pos.y) && (y <= this.pos.y + this.size.y);
  }
});

ig.Font.inject({
  drawRelative: function(text, x, y, alignment) {
    this.draw(text, x - ig.game.screen.x, y - ig.game.screen.y, alignment);
  }
});

MainGame = ig.Game.extend({
  
  font: new ig.Font('media/04b03.font.png'),
  pauseBackground: new ig.Image('media/pause_background.png'),

  gravity: 300,
  player: null,
  goalManager: null,
  paused: false,
  briefing: false,
  won: false,
  lost: false,
  levels: [LevelLevel1, LevelLevel2, LevelLevel3],
  currentLevelId: 0,
  transitioning: false,
  
  init: function() {
    ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
    ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
    ig.input.bind(ig.KEY.UP_ARROW, 'jump');
    ig.input.bind(ig.KEY.Z, 'jump');
    ig.input.bind(ig.KEY.X, 'fire');
    ig.input.bind(ig.KEY.C, 'hack');

    ig.input.bind(ig.KEY.SPACE, 'confirm');
    ig.input.bind(ig.KEY.P, 'pause');

    ig.music.add('media/music/music.*');
    ig.music.volume = 0.5;
    ig.music.loop = true;
    ig.music.play();

    this.loadLevel(this.levels[this.currentLevelId]);
    this.paused = this.briefing = true;
  },
  
  update: function() {
    if (this.transitioning) {
      this.parent();
      return;
    }

    if (this.player) {
      this.screen.x = this.player.pos.x - ig.system.width / 2;
      this.screen.y = this.player.pos.y - ig.system.height / 2;
    }
    if (this.paused) {
      if (this.briefing) {
        if (ig.input.pressed('confirm')) this.briefing = this.paused = false;
      } else if (this.won) {
        if (ig.input.pressed('confirm')) this.goToNextLevel();
      } else if (this.lost) {
        if (ig.input.pressed('confirm')) this.restartLevel();
      } else {
        if (ig.input.pressed('pause')) this.paused = false;
      }
    } else {
      this.parent();
      if (ig.input.pressed('pause')) this.paused = true;
    }
  },
  
  draw: function() {
    this.parent();
    if (this.paused) {
      this.pauseBackground.draw(0, 0);
      if (this.won) {
        this.font.draw("MISSION COMPLETE", 120, 80, ig.Font.ALIGN.CENTER);
        this.font.draw("Press SPACE to continue", 7, 148, ig.Font.ALIGN.LEFT);
      } else if (this.lost) {
        this.font.draw("MISSION FAILED", 120, 80, ig.Font.ALIGN.CENTER);
        this.font.draw("Press SPACE to restart", 7, 148, ig.Font.ALIGN.LEFT);
      } else {
         this.goalManager.drawGoals();
      }
    }
  },

  playerIsVisibleTo: function(entity, xRestriction, yRestriction) {
    if (xRestriction === undefined) xRestriction = true;
    if (yRestriction === undefined) yRestriction = true;

    if (this.player) {
      var entityCenter = entity.center(), playerCenter = this.player.center();
      var xd = playerCenter.x - entityCenter.x,
          yd = playerCenter.y - entityCenter.y;

      if (xRestriction && ((entity.flip && xd > 0) || (!entity.flip && xd < 0))) return false;
      if (yRestriction && ((yd > entity.size.y) || (yd < -entity.size.y))) return false;
      
      var distanceToPlayerSquared = (xd * xd) + (yd * yd);

      if (distanceToPlayerSquared <= entity.lengthOfSightSquared) {
        var result = this.collisionMap.trace(entityCenter.x, entityCenter.y, xd, yd, 1, 1);

        if (!result.collision.x && !result.collision.y) {
          var direction = {
            x: playerCenter.x - entityCenter.x,
            y: playerCenter.y - entityCenter.y
          };
          var len = Math.sqrt((direction.x * direction.x) + (direction.y * direction.y));
          direction.x /= len;
          direction.y /= len;

          var point = {
            x: entityCenter.x,
            y: entityCenter.y
          },
          distanceTravelled = { x: 0, y: 0 };
          
          var step = 2;
          var xMove = step * direction.x, yMove = step * direction.y;
          var absXMove = Math.abs(xMove), absYMove = Math.abs(yMove)
          while ((distanceTravelled.x * distanceTravelled.x) + (distanceTravelled.y * distanceTravelled.y) <= entity.lengthOfSightSquared) {
            point.x += xMove;
            point.y += yMove;

            for (var i in this.entities) {
              if ((this.entities[i].blocksHitScan || this.entities[i].id === this.player.id) && this.entities[i].collisionAtPoint(point.x, point.y)) {
                return this.entities[i].id === this.player.id;
              }
            }            

            distanceTravelled.x += absXMove;
            distanceTravelled.y += absYMove;
          }
          return true;
        }
        return false
      }
      return false;
    }
    return false;
  },

  win: function() {
    this.won = this.paused = true;
  },

  lose: function() {
    this.lost = this.paused = true;
  },

  goToNextLevel: function() {
    if (++this.currentLevelId >= this.levels.length) {
      ig.system.setGame(Ending);
    } else {
      this.restartLevel();
    }
  },

  restartLevel: function() {
    this.loadLevelDeferred(this.levels[this.currentLevelId]);
    this.transitioning = true;
  },

  loadLevel: function(level) {
    this.parent(level);
    this.won = this.lost = this.transitioning = false;
    this.paused = this.briefing = true;
    for (var i = 0; i < this.entities.length; i++) this.entities[i].afterInit();
  }
 });

Menu = ig.Game.extend({
  
  font: new ig.Font('media/04b03_black.font.png'),
  gravity: 300,
  started: false,

  init: function() {
    ig.input.bind(ig.KEY.SPACE, 'confirm');
    this.loadLevel(LevelMenu);
  },

  update: function() {
    if (ig.input.pressed('confirm') && !this.started) {
      this.getEntitiesByType(EntityMenuPlayer)[0].go();
      this.started = true;
    }
    this.parent();
  },

  draw: function() {
    this.parent();
    if (!this.started) {
      this.font.draw('AIRSHIP INFILTRATION', 7, 7, ig.Font.ALIGN.LEFT);
      this.font.draw('By Max Foster', 7, 15, ig.Font.ALIGN.LEFT);
      this.font.draw('LEFT/RIGHT to move', 120, 120, ig.Font.ALIGN.CENTER);
      this.font.draw('Z/UP to jump', 120, 128, ig.Font.ALIGN.CENTER);
      this.font.draw('X to shoot', 120, 136, ig.Font.ALIGN.CENTER);
      this.font.draw('PRESS SPACE TO START', 120, 150, ig.Font.ALIGN.CENTER);
    }
  },

  startGame: function() {
    ig.system.setGame(MainGame);
  }
});

Ending = ig.Game.extend({
  font: new ig.Font('media/04b03_black.font.png'),
  gravity: 300,
  started: false,
  timer: null,

  init: function() {
    ig.input.bind(ig.KEY.SPACE, 'confirm');
    this.loadLevel(LevelEnding);
    timer = new ig.Timer();
  },

  update: function() {
    if (timer.delta() > 2) {
      var airship = this.getEntitiesByType(EntityMenuAirship)[0];
      if (airship && !airship.exploding) airship.explode();
    }
    this.parent();
  },

  backToMenu: function() {
    ig.system.setGame(Menu);
  }
});

if (ig.ua.mobile) ig.Sound.enabled = false;
ig.setNocache(true);
ig.main('#canvas', Menu, 60, 240, 160, 3);

});
