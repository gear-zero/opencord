import { protectedProcedure, router } from "../index";
import { redis } from "../lib/redis";

export const wsRouter = router({
  getTicket: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const ticket = crypto.randomUUID();
    const key = `ws_ticket:${ticket}`;

    await redis.set(key, userId, { ex: 30 });

    return { ticket };
  }),
});
