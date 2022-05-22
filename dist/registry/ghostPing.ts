import Eris from "eris";
import * as Util from "../handler/Util";
import GMDIBot from "../handler/Client";
import Config from "../config/config";

export default async (client: Eris.Client & GMDIBot, msg: Eris.Message<Eris.GuildTextableChannel> | DeletedMessage, oldMessage?: Eris.OldMessage) => {
  try {
    // check message
    let message = await Util.transformMessage(client, msg);
    if (!message || message.author.bot || message.guildID !== Config.guildID) return;

    const embed = new Eris.RichEmbed()
      .setTimestamp()
      .setAuthor(
        `Ghost Ping dari: ${message.author.username}#${message.author.discriminator}`,
        undefined,
        message.author.dynamicAvatarURL("png", 32)
      );

    let ctx: Eris.MessageContent = {
      embeds: [embed],

      messageReference: {
        messageID: message.id,
        failIfNotExists: false
      },

      allowedMentions: {
        users: true,
        repliedUser: true,
        everyone: false,
        roles: false
      }
    };

    // from messageUpdate (edited, stuff)
    if (oldMessage) {
      embed.setColor(0xF29C3F);

      if (oldMessage.content) {
        embed.setDescription(oldMessage.content);
      };

      // temporary checking
      // @ts-expect-error
      let userDiffer = checkMentionsDifference((oldMessage.mentions as Eris.User[]).map(val => val.id), message.mentions.map(val => val.id));
      let roleDiffer = checkMentionsDifference(oldMessage.roleMentions, message.roleMentions);

      if (userDiffer.length || roleDiffer.length) {
        let ignored = await isIgnored(client, message.id);
        if (ignored) {
          return;
        } else {
          if (userDiffer.length) {
            console.log(userDiffer)
            ctx.content = userDiffer.join(" ");
          };
        };
      } else {
        return;
      };
    }

    // from messageDelete(pure)
    else {
      embed.setColor(0xF53131);

      if (message.content) {
        embed.setDescription(message.content);
      };

      const check = await checkMentions(client, message);

      if (check?.hasMentions) {
        let ignored = await isIgnored(client, message.id);
        if (ignored) {
          return;
        } else {
          ctx.content = check.variant.join(" ");
        };
      } else {
        return;
      };
    };

    await client.createMessage(message.channel.id, ctx);
    
    return;
  } catch (error) {
    return console.error(error);
  };
};

async function isIgnored(client: Eris.Client & GMDIBot, messageID: string) {
  const ignoreCheckingKey = "ignoreChecking";
  const check = await client.database.get(ignoreCheckingKey) as string[] | null;
  if (!check?.find(val => val == messageID)) {
    await client.database.push(ignoreCheckingKey, messageID);
    return false;
  } else {
    return true;
  };
};

function checkMentionsDifference(arr1: string[], arr2: string[]) {
  return arr1
    .filter(x => !arr2.includes(x))
    .concat(arr2.filter(x => !arr1.includes(x)));
};

async function checkMentions(client: Eris.Client, message: Eris.Message<Eris.GuildTextableChannel>) {
  let hasMentions: boolean = false;
  let variant: string[] = [];

  // check user mentions
  const UserMention = message.mentions.filter(val => (val.id !== message.author.id && !val.bot)); // depressing filter func
  if (UserMention.length >= 1) {
    variant = UserMention.map(val => val.mention);
    hasMentions = true;
  };

  // check role mentions
  const RoleMention = message.roleMentions;
  if (RoleMention.length >= 1) {
    let rolesMentionable = (message.channel?.guild?.roles || await client.getRESTGuildRoles(message.guildID)).filter(val => val.mentionable);
    let check = rolesMentionable.some(val => RoleMention.includes(val.id));

    hasMentions = check;
  };

  return { hasMentions, variant };
};