import crypto from "crypto";
import Eris from "eris";
import mime from "mime-db";

export async function transformMessage(client: Eris.GMDIExtension, message: Eris.Message<Eris.GuildTextableChannel> | DeletedMessage | null): Promise<Eris.Message<Eris.GuildTextableChannel> | null> {
  if (message) {
    if (message instanceof Eris.Message) {
      return message;
    } else {
      try {
        let restMessage = await client.getMessage(message.channel.id, message.id).catch(() => {return null});

        if (restMessage) {
          return message = restMessage as Eris.Message<Eris.GuildTextableChannel>;
        } else {
          return null;
        };
      } catch (error) {
        console.error(error);
        return null;
      };
    }
  } else {
    return null;
  };
};

export function countString(string: string) {
  let freq = {};

  for (let i = 0; i < string.length; i++) {
    let char = string.charAt(i);
    freq[char] ? freq[char]++ : freq[char] = 1;
  };

  return Object.keys(freq).length >= 1 ? freq : null;
};

export function generateHash(length: number) {
  return crypto.randomBytes(length / 2).toString("hex");
};

export function truncate(str: string, len: number) {
  return (str.length >= len) ? str.substring(0, len - 1) + '...' : str;
};

export function contentTypeDecide(content_type: string) {
  let type = content_type.toLowerCase(), mimeExtension = mime[type].extensions;

  switch (content_type) {
    case "image/png": return "png";
    case "image/jpeg": return "jpeg";
    case "image/jpg": return "jpg";
    case "image/webp": return "webp";
    case "video/webm": return "webm";
    case "audio/mpeg": return "mp3";
    case "video/mpeg": case "video/mp4": return "mp4";
    case "video/quicktime": return "mov";
    default: mimeExtension !== undefined ? mimeExtension[0] : undefined;
  };
};

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};