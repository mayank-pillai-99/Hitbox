// "~71h", or a plain note when IGDB has no time to beat for the game.
export const formatHours = (hours) => (hours === null || hours === undefined ? 'Length unknown' : `~${hours}h`);
