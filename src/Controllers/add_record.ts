import { User } from "../Models/User";
import { MyContext } from "../types/MyContext";

export const addRecordHandler = async (ctx: MyContext) => {
  if (!ctx.session) {
    ctx.session = {};
  }

  const user = await User.findOne({ telegramId: ctx.from!.id });

  if (!user) {
    await ctx.reply("❌ Ви не зареєстровані. Використайте команду /register.");
    return;
  }

  ctx.session.step = "WAITING_MORNING_BP";
  ctx.session.userData = ctx.session.userData || {};

  await ctx.reply(
    "🌅 Введіть ранковий артеріальний тиск у форматі Систолічний/Діастолічний (наприклад: 120/80):"
  );
};

export const handleAddRecord = async (ctx: MyContext) => {
  const user = await User.findOne({ telegramId: ctx.from!.id });

  if (!user) {
    await ctx.reply("❌ Ви не зареєстровані.");
    return;
  }

  const messageText = ctx.message?.text?.trim();

  if (!messageText) {
    await ctx.reply("❌ Повідомлення не містить тексту. Спробуйте ще раз.");
    return;
  }

  if (ctx.session.step === "WAITING_MORNING_BP") {
    const bpMatch = messageText.match(/^(\d{2,3})\/(\d{2,3})$/);
    if (!bpMatch) {
      await ctx.reply(
        "❌ Невірний формат. Введіть у форматі Систолічний/Діастолічний (наприклад: 120/80)."
      );
      return;
    }

    let lastRecord = user.records.pop();
    ctx.session.userData!.records!.push({
      date: new Date().toISOString().split("T")[0],
      morning: {
        systolic: parseInt(bpMatch[1]),
        diastolic: parseInt(bpMatch[2]),
        pulse: 0,
      },
      evening: {
        systolic: 0,
        diastolic: 0,
        pulse: 0,
      },
    });
    ctx.session.step = "WAITING_MORNING_PULSE";
    await ctx.reply("💓 Введіть ранковий пульс:");
  } else if (ctx.session.step === "WAITING_MORNING_PULSE") {
    const pulse = parseInt(messageText);
    if (isNaN(pulse) || pulse < 30 || pulse > 200) {
      await ctx.reply(
        "❌ Невірне значення пульсу. Введіть число від 30 до 200."
      );
      return;
    }

    ctx.session.userData!.records!.morning!.pulse = pulse;
    ctx.session.step = "WAITING_EVENING_BP";
    await ctx.reply(
      "🌆 Введіть вечірній артеріальний тиск у форматі Систолічний/Діастолічний (наприклад: 120/80):"
    );
  } else if (ctx.session.step === "WAITING_EVENING_BP") {
    const bpMatch = messageText.match(/^(\d{2,3})\/(\d{2,3})$/);
    if (!bpMatch) {
      await ctx.reply(
        "❌ Невірний формат. Введіть у форматі Систолічний/Діастолічний (наприклад: 120/80)."
      );
      return;
    }

    ctx.session.userData!.evening = {
      systolic: parseInt(bpMatch[1]),
      diastolic: parseInt(bpMatch[2]),
      pulse: 0,
    };
    ctx.session.step = "WAITING_EVENING_PULSE";
    await ctx.reply("💓 Введіть вечірній пульс:");
  } else if (ctx.session.step === "WAITING_EVENING_PULSE") {
    const pulse = parseInt(messageText);
    if (isNaN(pulse) || pulse < 30 || pulse > 200) {
      await ctx.reply(
        "❌ Невірне значення пульсу. Введіть число від 30 до 200."
      );
      return;
    }

    ctx.session.userData!.evening!.pulse = pulse;

    const { morning, evening } = ctx.session.userData!;
    user.records.push({
      date: new Date().toISOString().split("T")[0],
      morning,
      evening,
    });

    await user.save();

    await ctx.reply("✅ Дані успішно збережені!");
    ctx.session.step = null;
    ctx.session.userData = {};
  }
};
