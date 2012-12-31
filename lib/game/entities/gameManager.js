ig.module(
  'game.entities.gameManager'
)
.requires(
  'impact.entity',
  'game.entities.computer',
  'game.entities.powersupply',
  'game.entities.guard',
  'game.entities.turret'
)
.defines(function() {
  EntityGameManager = ig.Entity.extend({
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(0, 0, 255, 0.7)',
    size: { x: 10, y: 10 },

    lifeImage: new ig.Image('media/life.png'),
    keycardImage: new ig.Image('media/keycard.png'),

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
      ig.game.gameManager = this;
      if (ig.game.player) this.spawnPoint = { x: ig.game.player.pos.x, y: ig.game.player.pos.y };
    },

    afterInit: function() {
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
        if (this._guardsToKillCount < 0) this._guardsToKillCount = -100; // i.e. don't kill any guards, otherwise you lose
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

    update: function() {
      if (this._guardsToKillCount && this._guardsToKillCount < -100) { // i.e. don't kill any guards, otherwise you lose
        ig.game.lose();
        return;
      }

      var allComputersHacked = this._computersToHackCount === null || (this._computersToHackCount !== null && this._computersToHackCount == 0);
      var allPowersuppliesKilled = this._powersuppliesToKillCount === null || (this._powersuppliesToKillCount !== null && this._powersuppliesToKillCount == 0);
      var allGuardsKilled = this._guardsToKillCount === null || (this._guardsToKillCount !== null && this._guardsToKillCount <= 0);
      var allTurretsKilled = this._turretsToKillCount === null || (this._turretsToKillCount !== null && this._turretsToKillCount == 0);
      if (allComputersHacked && allPowersuppliesKilled && allGuardsKilled && allTurretsKilled) ig.game.win();
    },

    draw: function() {},

    drawHud: function() {
      var i = 0;
      for (; i < this.lives; i++) {
        this.lifeImage.draw(i * 12 + 5, 5);
      }
      var player = ig.game.player;
      if (player) {
        if (ig.game.font) ig.game.font.draw('HP: ' + player.health, i * 12 + 7, 7, ig.Font.ALIGN.LEFT);

        for (i = 0; i < player.keycards; i++) {
          this.keycardImage.draw(ig.system.width - (i * 3 + 13), 5);
        }
      }
    },

    drawObjectives: function() {
      var font = ig.game.font;
      if (!font) return;

      font.draw('LEVEL ' + (ig.game.currentLevelId + 1), 120, 7, ig.Font.ALIGN.CENTER);

      if (!ig.game.briefing) font.draw('PAUSED', 230, 7, ig.Font.ALIGN.RIGHT);

      font.draw('MISSION OBJECTIVES:', 7, 27, ig.Font.ALIGN.LEFT);
      var nextY = 38;
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
        var text;
        if (this._guardsToKillCount <= -100) {
          text = 'Do not terminate any guards!';
        } else {
          var noun = this._guardsToKillCount == 1 ? 'guard' : 'guards';
          text = 'Terminate ' + this._guardsToKillCount + more + ' ' + noun;
        }
        font.draw(text, 7, nextY, ig.Font.ALIGN.LEFT);
      }

      if (ig.game.briefing) {
        font.draw('Press SPACE to start', 7, 148, ig.Font.ALIGN.LEFT);
      } else {
        font.draw('Press P to unpause', 7, 148, ig.Font.ALIGN.LEFT);
      }
      font.draw('Press Q to quit', 230, 148, ig.Font.ALIGN.RIGHT);
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
