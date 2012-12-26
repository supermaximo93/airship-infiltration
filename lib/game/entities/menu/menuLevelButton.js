ig.module(
  'game.entities.menu.menuLevelButton'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityMenuLevelButton = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/menu_level_button.png', 16, 16),

    size: { x: 16, y: 16 },
    gravityFactor: 0,
    levelId: -1,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
    },

    update: function() {
      if (ig.input.released('click')) {
        var mouseX = ig.input.mouse.x, mouseY = ig.input.mouse.y;
        if (mouseX >= this.pos.x && mouseX <= this.pos.x + this.size.x && mouseY >= this.pos.y && mouseY <= this.pos.y + this.size.y) {
          ig.game.startIntro(this.levelId);
        }
      }
      this.parent();
    },

    draw: function() {
      this.parent();
      if (ig.game.font) {
        ig.game.font.draw(this.levelId + 1, this.center().x, this.pos.y + 5, ig.Font.ALIGN.CENTER);
      }
    }
  });
});
