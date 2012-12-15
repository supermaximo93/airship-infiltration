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
    ig.input.bind(ig.KEY.SPACE, 'jump');

    this.loadLevel(LevelMap1);
  },
  
  update: function() {
    this.parent();
  },
  
  draw: function() {
    this.parent();
  }
});

ig.main( '#canvas', MyGame, 60, 320, 240, 2 );

});
