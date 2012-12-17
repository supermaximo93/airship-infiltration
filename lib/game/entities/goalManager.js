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
    _computersToHackCount: null,
    powersuppliesToKillCount: null,
    _powersuppliesToKillCount: null,
    guardsToKillCount: null,
    _guardsToKillCount: null,
    turretsToKillCount: null,
    _turretsToKillCount: null,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      ig.game.goalManager = this;
      if (ig.game.player) this.spawnPoint = { x: ig.game.player.pos.x, y: ig.game.player.pos.y };
    },

    update: function() {
      var allComputersHacked = this._computersToHackCount === null || (this._computersToHackCount !== null && this._computersToHackCount == 0);
      var allPowersuppliesKilled = this._powersuppliesToKillCount === null || (this._powersuppliesToKillCount !== null && this._powersuppliesToKillCount == 0);
      var allGuardsKilled = this._guardsToKillCount === null || (this._guardsToKillCount !== null && this._guardsToKillCount == 0);
      var allTurretsKilled = this._turretsToKillCount === null || (this._turretsToKillCount !== null && this._turretsToKillCount == 0);
      if (allComputersHacked && allPowersuppliesKilled && allGuardsKilled && allTurretsKilled) ig.game.win();
    },

    draw: function() {
      var i = 0;
      for (; i < this.lives; i++) {
        this.lifeImage.draw(i * 12 + 5, 5);
      }
      if (ig.game.player && ig.game.font) ig.game.font.draw('HP: ' + ig.game.player.health, i * 12 + 7, 7, ig.Font.ALIGN.LEFT);
    },

    updateGoalCounts: function() {
      if (this.computersToHackCount !== null) {
        this._computersToHackCount = this.computersToHackCount;
      } else {
        this._computersToHackCount = ig.game.getEntitiesByType(EntityComputer).length;
      }
      if (this._computersToHackCount == 0) this._computersToHackCount = null;

      if (this.powersuppliesToKillCount !== null) {
        this._powersuppliesToKillCount = this.powersuppliesToKillCount;
      } else {
        this._powersuppliesToKillCount = ig.game.getEntitiesByType(EntityPowersupply).length;
      }
      if (this._powersuppliesToKillCount == 0) this._powersuppliesToKillCount = null;
      
      if (this.guardsToKillCount !== null) {
        this._guardsToKillCount = this.guardsToKillCount;
      } else {
        this._guardsToKillCount = ig.game.getEntitiesByType(EntityGuard).length;
      }
      if (this._guardsToKillCount == 0) this._guardsToKillCount = null;

      if (this.turretsToKillCount !== null) {
        this._turretsToKillCount = this.turretsToKillCount;
      } else {
        this._turretsToKillCount = ig.game.getEntitiesByType(EntityTurret).length;
      }
      if (this._turretsToKillCount == 0) this._turretsToKillCount = null;
    },

    drawGoals: function() {
      var font = ig.game.font;
      if (!ig.game.briefing) font.draw('PAUSED', 230, 7, ig.Font.ALIGN.RIGHT);
      font.draw('MISSION OBJECTIVES:', 7, 7, ig.Font.ALIGN.LEFT);
      var nextY = 18;
      var more = ig.game.briefing ? '' : ' more';
      if (this._computersToHackCount !== null) {
        var noun = this._computersToHackCount == 1 ? 'computer' : 'computers';
        font.draw('Hack ' + this._computersToHackCount + more + ' ' + noun, 7, nextY, ig.Font.ALIGN.LEFT);
        nextY += 9;
      }
      if (this._powersuppliesToKillCount !== null) {
        var noun = this._powersuppliesToKillCount == 1 ? 'supply' : 'supplies';
        font.draw('Destroy ' + this._powersuppliesToKillCount + more + ' power ' + noun, 7, nextY, ig.Font.ALIGN.LEFT);
        nextY += 9
      }
      if (this._turretsToKillCount !== null) {
        var noun = this._turretsToKillCount == 1 ? 'turret' : 'turrets';
        font.draw('Destroy ' + this._turretsToKillCount + more + ' ' + noun, 7, nextY, ig.Font.ALIGN.LEFT);
        nextY += 9
      }
      if (this._guardsToKillCount !== null) {
        var noun = this._guardsToKillCount == 1 ? 'guard' : 'guards';
        font.draw('Terminate ' + this._guardsToKillCount + more + ' ' + noun, 7, nextY, ig.Font.ALIGN.LEFT);
      }

      if (ig.game.briefing) {
        font.draw('Press SPACE to start', 7, 148, ig.Font.ALIGN.LEFT);
      } else {
        font.draw('Press P to unpause', 7, 148, ig.Font.ALIGN.LEFT);
      }
    },

    powersupplyKilledTrigger: function() {
      this._powersuppliesToKillCount--;
    },

    turretKilledTrigger: function() {
      this._turretsToKillCount--;
    },

    guardKilledTrigger: function() {
      this._guardsToKillCount--;
    },

    computerHackedTrigger: function() {
      this._computersToHackCount--;
    },

    playerDeathTrigger: function() {
      if (--this.lives <= 0) {
        ig.game.lose();
      } else {
        ig.game.spawnEntity(EntityPlayer, this.spawnPoint.x, this.spawnPoint.y, { invincible: true });
      }
    }
  });
});
