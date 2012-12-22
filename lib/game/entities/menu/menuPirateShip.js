ig.module(
  'game.entities.menu.menuPirateShip'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityMenuPirateShip = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/menu_pirate_ship.png', 10, 8),

    size: { x: 10, y: 8 },
    gravityFactor: 0,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
    }
  });
});
