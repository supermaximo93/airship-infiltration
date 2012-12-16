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

    computersToHackCount: null,
    powersuppliesToKillCount: null,
    won: false,

    update: function() {
      var allComputersHacked = this.computersToHackCount !== null && this.computersToHackCount == 0;
      var allPowersuppliesKilled = this.powersuppliesToKillCount !== null && this.powersuppliesToKillCount == 0;
      if (allComputersHacked && allPowersuppliesKilled) this.win();
    },

    draw: function() {},

    win: function() {
      if (!this.won) alert('win!');
      this.won = true;
    },

    powersupplyKilledTrigger: function() {
      this.powersuppliesToKillCount--;
    },

    computerHackedTrigger: function() {
      this.computersToHackCount--;
    }
  });
});
