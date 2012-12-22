ig.module(
  'game.entities.menu.menuCloud'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityMenuCloud = ig.Entity.extend({
    animSheet: new ig.AnimationSheet('media/menu_clouds.png', 30, 20),

    size: { x: 30, y: 20 },
    vel: { x: 200, y: 0 },
    gravityFactor: 0,
    imageCount: 3,
    images: [],

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      for (var i = 0; i < this.imageCount; i++) this.images.push(this.addAnim('image' + i, 1, [i]));
      this.setNewImage();
    },

    update: function() {
      if (this.pos.x > 240) {
        this.pos.x = -this.size.x * 1.5;
        this.setNewImage();
      }
      this.parent();
    },

    setNewImage: function() {
      var index = Math.round(Math.random() * (this.imageCount - 1));
      this.currentAnim = this.images[index];
    }
  });
});
