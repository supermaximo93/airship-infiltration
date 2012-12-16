ig.module(
  'game.entities.goalManager'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityGoalManager = ig.Entity.extend({
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(0, 0, 255, 0.7)',
    size: { x: 10, y: 10 },

    lifeImage: new ig.Image('media/life.png'),

    lives: 3,
    spawnPoint: null,
    computersToHackCount: null,
    powersuppliesToKillCount: null,
    won: false,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      ig.game.goalManager = this;
      if (ig.game.player) this.spawnPoint = { x: ig.game.player.pos.x, y: ig.game.player.pos.y };
    },

    update: function() {
      var allComputersHacked = this.computersToHackCount !== null && this.computersToHackCount == 0;
      var allPowersuppliesKilled = this.powersuppliesToKillCount !== null && this.powersuppliesToKillCount == 0;
      if (allComputersHacked && allPowersuppliesKilled) this.win();
    },

    draw: function() {
      for (var i = 0; i < this.lives; i++) {
        this.lifeImage.draw(i * 12 + 5, 5);
      }
    },

    win: function() {
      if (!this.won) alert('win!');
      this.won = true;
    },

    powersupplyKilledTrigger: function() {
      this.powersuppliesToKillCount--;
    },

    computerHackedTrigger: function() {
      this.computersToHackCount--;
    },

    playerDeathTrigger: function() {
      if (--this.lives <= 0) {
        // lose game
      } else {
        ig.game.spawnEntity(EntityPlayer, this.spawnPoint.x, this.spawnPoint.y, {});
      }
    }
  });
});
