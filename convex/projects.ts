import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("projects"), userId: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== args.userId) return null;
    return project;
  },
});

export const create = mutation({
  args: { name: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      name: args.name,
      userId: args.userId,
    });
  },
});
