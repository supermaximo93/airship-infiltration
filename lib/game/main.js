ig.module( 
  'game.main'
)
.requires(
  'impact.game',
  'impact.font',

  'game.entities.particleEffect',
  'game.entities.keycard',
  'game.entities.menu.menuLevelButton',

  'game.levels.menu.menu',
  'game.levels.menu.ending',
  'game.levels.level1',
  'game.levels.level2',
  'game.levels.level3',
  'game.levels.level4',
  'game.levels.level5',
  'game.levels.level6',
  'game.levels.level7',
  'game.levels.level8',
  'game.levels.level9',
  'game.levels.level10',
  'game.levels.level11'
)
.defines(function(){

ig.Entity.inject({
  afterInit: function() {},

  center: function() {
    return { x: this.pos.x + this.size.x / 2, y: this.pos.y + this.size.y / 2 };
  },

  collisionAtPoint: function(x, y) {
    return (x >= this.pos.x) && (x <= this.pos.x + this.size.x) && (y >= this.pos.y) && (y <= this.pos.y + this.size.y);
  },

  playerIsNear: function(radiusSquared) {
    var player = ig.game.player;
    if (!player) return false;

    if (!radiusSquared) radiusSquared = 225;

    var playerCenter = player.center(), thisCenter = this.center();
    var xDist = playerCenter.x - thisCenter.x, yDist = playerCenter.y - thisCenter.y;
    var distanceSquared = (xDist * xDist) + (yDist * yDist);
    return distanceSquared <= radiusSquared;
  }
});

ig.Map.inject({
  pixelWidth: function() {
    return this.width * this.tilesize;
  },

  pixelHeight: function() {
    return this.height * this.tilesize;
  },

  pixelDimensions: function() {
    return {
      x: this.pixelWidth(),
      y: this.pixelHeight()
    };
  }
});

ig.Font.inject({
  drawRelative: function(text, x, y, alignment) {
    this.draw(text, x - ig.game.screen.x, y - ig.game.screen.y, alignment);
  },

  buffer: function(text, x, y, alignment, relative) {
    if (ig.game.textDrawBuffer) {
      ig.game.textDrawBuffer.push({
        text: text,
        x: x,
        y: y,
        alignment: alignment,
        relative: relative || false
      });
    }
  },

  bufferRelative: function(text, x, y, alignment) {
    this.buffer(text, x, y, alignment, true);
  }
});


MainGame = ig.Game.extend({
  
  font: new ig.Font('media/04b03.font.png'),
  pauseBackground: new ig.Image('media/pause_background.png'),

  gravity: 300,
  player: null,
  gameManager: null,
  paused: false,
  briefing: false,
  won: false,
  lost: false,
  currentLevelId: 0,
  transitioning: false,

  textDrawBuffer: [],
  
  init: function() {
    ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
    ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
    ig.input.bind(ig.KEY.UP_ARROW, 'jump');
    ig.input.bind(ig.KEY.Z, 'jump');
    ig.input.bind(ig.KEY.X, 'fire');
    ig.input.bind(ig.KEY.C, 'action');

    ig.input.bind(ig.KEY.SPACE, 'confirm');
    ig.input.bind(ig.KEY.P, 'pause');
    ig.input.bind(ig.KEY.Q, 'quit');

    ig.music.add('media/music/music.*');
    ig.music.volume = 0.5;
    ig.music.loop = true;
    ig.music.play();

    if (MainGame.startLevelId >= 0 && MainGame.startLevelId < MainGame.levels.length) this.currentLevelId = MainGame.startLevelId;
    this.loadLevel(MainGame.levels[this.currentLevelId]);
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
      if (this.screen.x < 0) this.screen.x = 0;
      if (this.screen.y < 0) this.screen.y = 0;

      var mapDimensions = this.getMapByName('main').pixelDimensions();
      if (this.screen.x + ig.system.width > mapDimensions.x) this.screen.x = mapDimensions.x - ig.system.width;
      if (this.screen.y + ig.system.height > mapDimensions.y) this.screen.y = mapDimensions.y - ig.system.height;
    }
    if (this.paused) {
      if (ig.input.pressed('quit')) {
        ig.Timer.timeScale = 1;
        ig.system.setGame(Menu);
      }

      if (this.briefing) {
        if (ig.input.pressed('confirm')) {
          ig.Timer.timeScale = 1;
          this.briefing = this.paused = false;
        }
      } else if (this.won) {
        if (ig.input.pressed('confirm')) {
          ig.Timer.timeScale = 1;
          this.goToNextLevel();
        }
      } else if (this.lost) {
        if (ig.input.pressed('confirm')) {
          ig.Timer.timeScale = 1;
          this.restartLevel();
        }
      } else {
        if (ig.input.pressed('pause')) {
          ig.Timer.timeScale = 1;
          this.paused = false;
        }
      }
    } else {
      this.parent();
      if (ig.input.pressed('pause')) {
        ig.Timer.timeScale = 0;
        this.paused = true;
      }
    }
  },
  
  draw: function() {
    this.parent();

    for (var i = 0, bufferedText = null; i < this.textDrawBuffer.length; i++) {
      bufferedText = this.textDrawBuffer[i];
      if (bufferedText.relative) {
        this.font.drawRelative(bufferedText.text, bufferedText.x, bufferedText.y, bufferedText.alignment);
      } else {
        this.font.draw(bufferedText.text, bufferedText.x, bufferedText.y, bufferedText.alignment);
      }
    }
    this.textDrawBuffer = [];

    this.gameManager.drawHud();
    if (this.paused) {
      this.pauseBackground.draw(0, 0);
      this.font.draw('LEVEL ' + (this.currentLevelId + 1), 120, 7, ig.Font.ALIGN.CENTER);
      if (this.won) {
        this.font.draw("MISSION COMPLETE", 120, 80, ig.Font.ALIGN.CENTER);
        this.font.draw("Press SPACE to continue", 7, 148, ig.Font.ALIGN.LEFT);
      } else if (this.lost) {
        this.font.draw("MISSION FAILED", 120, 80, ig.Font.ALIGN.CENTER);
        this.font.draw("Press SPACE to restart", 7, 148, ig.Font.ALIGN.LEFT);
      } else {
         this.gameManager.drawObjectives();
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
    if (++this.currentLevelId >= MainGame.levels.length) {
      ig.system.setGame(Ending);
    } else {
      this.restartLevel();
    }
  },

  restartLevel: function() {
    this.loadLevelDeferred(MainGame.levels[this.currentLevelId]);
    this.transitioning = true;
  },

  loadLevel: function(level) {
    this.parent(level);
    this.won = this.lost = this.transitioning = false;
    this.paused = this.briefing = true;
    for (var i = 0; i < this.entities.length; i++) this.entities[i].afterInit();
    ig.Timer.timeScale = 0;
  }
 });

MainGame.levels = [LevelLevel1, LevelLevel2, LevelLevel3, LevelLevel4, LevelLevel5, LevelLevel6, LevelLevel7, LevelLevel8, LevelLevel9, LevelLevel10, LevelLevel11];
MainGame.startLevelId = -1;

Menu = ig.Game.extend({
  
  font: new ig.Font('media/04b03_black.font.png'),
  gravity: 300,
  started: false,

  init: function() {
    ig.input.bind(ig.KEY.SPACE, 'confirm');
    ig.input.bind(ig.KEY.MOUSE1, 'click');
    this.loadLevel(LevelMenu);
    var rows = 7;
    var columns = Math.ceil(MainGame.levels.length / rows);
    var levelId = 0;
    for (var column = 0; column < columns; column++) {
      var breakNow = false;
      for (var row = 0; row < rows; row++) {
        this.spawnEntity(EntityMenuLevelButton, ig.system.width - (18 * (columns - column)) - 14, row * 20 + 12, { levelId: levelId });
        levelId++;
        if (levelId >= MainGame.levels.length) {
          breakNow = true;
          break;
        }
      }
      if (breakNow) break;
    }
    ig.music.stop();
  },

  draw: function() {
    this.parent();
    if (!this.started) {
      this.font.draw('AIRSHIP INFILTRATION', 7, 7, ig.Font.ALIGN.LEFT);
      this.font.draw('by SUPERMAXIMO', 14, 20, ig.Font.ALIGN.LEFT);
      this.font.draw('LEFT/RIGHT to move', 120, 112, ig.Font.ALIGN.CENTER);
      this.font.draw('Z/UP to jump', 120, 120, ig.Font.ALIGN.CENTER);
      this.font.draw('X to shoot', 120, 128, ig.Font.ALIGN.CENTER);
      this.font.draw('P to pause', 120, 136, ig.Font.ALIGN.CENTER);
      this.font.draw('CLICK TO SELECT LEVEL ->', 120, 150, ig.Font.ALIGN.CENTER);
    }
  },

  startIntro: function(levelId) {
    MainGame.startLevelId = levelId;
    if (!this.started) {
      var menuLevelButtons = this.getEntitiesByType(EntityMenuLevelButton);
      for (var i = 0; i < menuLevelButtons.length; i++) {
        menuLevelButtons[i].kill();
      }
      this.getEntitiesByType(EntityMenuPlayer)[0].go();
      this.started = true;
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
ig.Sound.enabled = false
if (ig.ua.mobile) ig.Sound.enabled = false;
ig.setNocache(true);
ig.main('#canvas', Menu, 60, 240, 160, 3);

});
