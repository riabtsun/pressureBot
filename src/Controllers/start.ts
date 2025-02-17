import { Context } from "grammy";

export const startHandler = async (ctx: Context) => {
  await ctx.reply(
    "👋 Привіт! Я бот для запису показників артеріального тиску.\n\n" +
      "✅ Щоб зареєструватись, натисни /register\n" +
      "📋 Якщо Ви вже зареєстровані, можете вводити данні або редагувати профіль за допомогою /edit_profile"
  );
};
