import { stripIndents } from "common-tags";
import Eris from "eris";
import GMDIBot from "../handler/Client";

export default async (client: Eris.Client & GMDIBot, msg: Eris.Message, emoji: Eris.PartialEmoji, reactor: Eris.Member | { id: string }) => {
  try {
    // must be presented in guild
    if (!msg.guildID || !msg?.channel?.id) return;

    if (reactor instanceof Eris.Member) {
      if (reactor.bot) return;
    };

    // check message
    let message = msg;
    if (!message.type) {
      let restMessage = await client.getMessage(msg.channel.id, msg.id);
      if (!restMessage) return;
      message = restMessage;
    };

    // star emoji validation
    const starEmoji = "⭐";
    const limit = 7;
    const channelID = "954291153203769354";

    if (!message.reactions[starEmoji]) return; // not star emoji
    if (message.reactions[starEmoji].me) return; // bot
    if (message.reactions[starEmoji].count >= limit) {
      if (client.database.has("postedStarboard")) {
        let check = client.database.get("postedStarboard") as string[] | null;
        if (check) {
          if (check.includes(message.id)) return;
          else client.database.push("postedStarboard", message.id);
        } else {
          return;
        };
      } else {
        client.database.set("postedStarboard", [message.id]);
      };

      const truncate = (str: string, num = 1000) => str.length >= num ? str.slice(0, num) + "..." : str;

      const embed = new Eris.RichEmbed()
        .setColor(0xffac33)
        .setTimestamp()
        .setAuthor(`${message.author.username}#${message.author.discriminator} (${message.author.id})`, undefined, message.author.dynamicAvatarURL("png", 16))
        .setDescription(stripIndents`
        ${truncate(message.content)}

        [Original Content](${message.jumpLink})
        `);

      if (message.attachments.length && /image\/(gif|png|jpe?g)/gi.test(message.attachments[0].content_type!)) {
        embed.setImage(message.attachments[0].proxy_url);
      };

      return client.createMessage(channelID, { content: message.channel.mention, embeds: [embed] });
    };
  } catch (error) {
    return console.error(error);
  }
};