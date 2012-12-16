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
    guardsToKillCount: null,
    won: false,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      ig.game.goalManager = this;
      if (ig.game.player) this.spawnPoint = { x: ig.game.player.pos.x, y: ig.game.player.pos.y };
    },

    update: function() {
      var allComputersHacked = this.computersToHackCount !== null && this.computersToHackCount == 0;
      var allPowersuppliesKilled = this.powersuppliesToKillCount !== null && this.powersuppliesToKillCount == 0;
      var allGuardsKilled = this.guardsToKillCount !== null && this.guardsToKillCount == 0;
      if (allComputersHacked && allPowersuppliesKilled && allGuardsKilled) this.win();
    },

    draw: function() {
      var i = 0;
      for (; i < this.lives; i++) {
        this.lifeImage.draw(i * 12 + 5, 5);
      }
      if (ig.game.player && ig.game.font) ig.game.font.draw('HP: ' + ig.game.player.health, i * 12 + 7, 7, ig.Font.ALIGN.LEFT);
    },

    drawGoals: function() {
      var font = ig.game.font;
      font.draw('PAUSED', 230, 7, ig.Font.ALIGN.RIGHT);
      font.draw('Objectives:', 7, 7, ig.Font.ALIGN.LEFT);
      var nextY = 18;
      if (this.computersToHackCount !== null) {
        var noun = this.computersToHackCount == 1 ? 'computer' : 'computers';
        font.draw('Hack ' + this.computersToHackCount + ' more ' + noun, 7, nextY, ig.Font.ALIGN.LEFT);
        nextY += 9;
      }
      if (this.powersuppliesToKillCount !== null) {
        var noun = this.powersuppliesToKillCount == 1 ? 'supply' : 'supplies';
        font.draw('Destroy ' + this.powersuppliesToKillCount + ' more power ' + noun, 7, nextY, ig.Font.ALIGN.LEFT);
        nextY += 9
      }
      if (this.guardsToKillCount !== null) {
        var noun = this.guardsToKillCount == 1 ? 'guard' : 'guards';
        font.draw('Terminate ' + this.guardsToKillCount + ' more ' + noun, 7, nextY, ig.Font.ALIGN.LEFT);
      }
    },

    win: function() {
      if (!this.won) console.log('win!');
      this.won = true;
    },

    powersupplyKilledTrigger: function() {
      this.powersuppliesToKillCount--;
    },

    guardKilledTrigger: function() {
      this.guardsToKillCount--;
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
