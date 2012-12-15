ig.module( 
  'game.main'
)
.requires(
  'impact.game',
  'impact.font',

  'impact.debug.debug',

  '..game.levels.map1'
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
  }
});

ig.main( '#canvas', MyGame, 60, 320, 240, 2 );

});
