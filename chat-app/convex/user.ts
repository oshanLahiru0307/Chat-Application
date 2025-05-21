import {mutation, internalMutation, internalQuery} from './_generated/server'
import {v} from 'convex/values'

export const create = internalMutation({
    args: {
        username: v.string(),
        imageUrl: v.string(),
        clerkId: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert('users', args);
    }
})

export const get = internalQuery({
    args: {
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
        .query('users')
        .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
        .unique();
    }
})

export const createOrUpdateUser = mutation({
    args: {
        username: v.string(),
        imageUrl: v.string(),
        clerkId: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query('users')
            .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
            .unique();

        if (existingUser) {
            return await ctx.db.patch(existingUser._id, args);
        }

        return await ctx.db.insert('users', args);
    }
})
