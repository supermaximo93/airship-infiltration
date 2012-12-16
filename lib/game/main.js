ig.module( 
  'game.main'
)
.requires(
  'impact.game',
  'impact.font',

  'impact.debug.debug',

  'game.entities.particleEffect',

  'game.levels.map1'
)
.defines(function(){

MyGame = ig.Game.extend({
  
  font: new ig.Font( 'media/04b03.font.png' ),

  gravity: 300,
  player: null,
  
  init: function() {
    ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
    ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
    ig.input.bind(ig.KEY.UP_ARROW, 'jump');
    ig.input.bind(ig.KEY.Z, 'jump');
    ig.input.bind(ig.KEY.X, 'fire');
    ig.input.bind(ig.KEY.C, 'hack');

    this.loadLevel(LevelMap1);
  },
  
  update: function() {
    if (this.player) {
      this.screen.x = this.player.pos.x - ig.system.width / 2;
      this.screen.y = this.player.pos.y - ig.system.height / 2;
    }
    this.parent();
  },
  
  draw: function() {
    this.parent();
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

ig.main( '#canvas', MyGame, 60, 360, 240, 2 );

});
