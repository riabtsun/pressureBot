import {Context} from "grammy";
import {botText} from "../utils/botText";

export const startHandler = async (ctx: Context) => {
  await ctx.reply(botText.start);
};
