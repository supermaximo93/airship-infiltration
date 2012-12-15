ig.module( 
  'game.main' 
)
.requires(
  'impact.game',
  'impact.font',

  '..game.levels.map1'
)
.defines(function(){

MyGame = ig.Game.extend({
  
  font: new ig.Font( 'media/04b03.font.png' ),

  gravity: 300,
  
  init: function() {
    ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
    ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
    ig.input.bind(ig.KEY.UP_ARROW, 'jump');
    ig.input.bind(ig.KEY.Z, 'jump');
    ig.input.bind(ig.KEY.X, 'fire');

    this.loadLevel(LevelMap1);
  },
  
  update: function() {
    var player = this.getEntitiesByType(EntityPlayer)[0];
    if (player) {
      this.screen.x = player.pos.x - ig.system.width / 2;
      this.screen.y = player.pos.y - ig.system.height / 2;
    }
    this.parent();
  },
  
  draw: function() {
    this.parent();
  }
});

ig.main( '#canvas', MyGame, 60, 320, 240, 2 );

});
