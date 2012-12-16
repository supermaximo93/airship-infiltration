ig.module( 
  'game.main'
)
.requires(
  'impact.game',
  'impact.font',

  'impact.debug.debug',

  'game.entities.particleEffect',

  '..game.levels.map1'
)
.defines(function(){

MyGame = ig.Game.extend({
  
  font: new ig.Font('media/04b03.font.png'),
  pauseBackground: new ig.Image('media/pause_background.png'),
  vignette: new ig.Image('media/vignette.png'),

  gravity: 300,
  player: null,
  goalManager: null,
  paused: false,
  briefing: false,
  won: false,
  lost: false,
  levels: [LevelMap1],
  currentLevelId: 0,
  
  init: function() {
    ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
    ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
    ig.input.bind(ig.KEY.UP_ARROW, 'jump');
    ig.input.bind(ig.KEY.Z, 'jump');
    ig.input.bind(ig.KEY.X, 'fire');
    ig.input.bind(ig.KEY.C, 'hack');

    ig.input.bind(ig.KEY.SPACE, 'confirm');
    ig.input.bind(ig.KEY.P, 'pause');

    this.restartLevel();
  },
  
  update: function() {
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
    //this.vignette.draw(0, 0);
  },

  playerIsVisibleTo: function(entity, xRestriction, yRestriction) {
    if (xRestriction === undefined) xRestriction = true;
    if (yRestriction === undefined) yRestriction = true;

    var playerVisible = false;
    if (this.player) {
      var entityCenter = entity.center(), playerCenter = this.player.center();
      var xd = playerCenter.x - entityCenter.x,
          yd = playerCenter.y - entityCenter.y;

      if (xRestriction && ((entity.flip && xd > 0) || (!entity.flip && xd < 0))) return false;
      if (yRestriction && ((yd > entity.size.y) || (yd < -entity.size.y))) return false;
      
      var distanceToPlayerSquared = (xd * xd) + (yd * yd);

      if (distanceToPlayerSquared <= entity.lengthOfSightSquared) {
        result = this.collisionMap.trace(entityCenter.x, entityCenter.y, xd, yd, 1, 1);
        return !result.collision.x && !result.collision.y;
      }
    }
    return playerVisible;
  },

  win: function() {
    this.won = this.paused = true;
  },

  lose: function() {
    this.lost = this.paused = true;
  },

  goToNextLevel: function() {
    if (++currentLevelId > levels.length) {
      // win screen
    } else {
      restartLevel();
    }
  },

  restartLevel: function() {
    this.won = this.lost = false;
    this.paused = this.briefing = true;
    this.loadLevel(this.levels[this.currentLevelId]);
  }
});

ig.Entity.inject({
  center: function() {
    return { x: this.pos.x + this.size.x / 2, y: this.pos.y + this.size.y / 2 };
  }
});

ig.Font.inject({
  drawRelative: function(text, x, y, alignment) {
    this.draw(text, x - ig.game.screen.x, y - ig.game.screen.y, alignment);
  }
});

if (ig.ua.mobile) ig.Sound.enabled = false;

ig.main( '#canvas', MyGame, 60, 240, 160, 3 );

});
