import Eris from "eris";
import config from "../config/config";
import GMDIBot from "../handler/Client";

export default async (client: Eris.Client & GMDIBot, guild: Eris.Guild, member: Eris.Member) => {
  if (guild.id !== config.guildID || member.bot) return;

  // still 
  let userDataWarn = await client.database.get(`warningLasted.${member.id}`) as WarningLastedOptions;
  if (userDataWarn && userDataWarn.level) {
    return client.editGuildMember(config.guildID, member.id, {roles: [config.warning.role[userDataWarn.level]]});
  };
};