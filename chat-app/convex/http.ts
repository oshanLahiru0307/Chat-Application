import { httpRouter } from "convex/server";
import { WebhookEvent } from "@clerk/nextjs/server"
import { Webhook } from "svix";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";


const http = httpRouter();

const validatePayload = async (req: Request) :

    Promise<WebhookEvent | undefined> => {

        const payload = await req.text();

        const svixHeaders = {
            'svix-id': req.headers.get('svix-id'),
            'svix-timestamp': req.headers.get('svix-timestamp')!,
            'svix-signature': req.headers.get('svix-signature')!,
        }

        const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
        try {
            const event = webhook.verify(payload, {
                'svix-id': svixHeaders['svix-id'] || '',
                'svix-timestamp': svixHeaders['svix-timestamp'],
                'svix-signature': svixHeaders['svix-signature']
            }) as WebhookEvent;
            return event;
        } catch (err) {
            console.error(err, 'Error verifying webhook payload');
            return;
        }
    }


const handleClerkWebhook = httpAction(async (ctx, req) => {
    const event = await validatePayload(req)
    if(!event) {
        return new Response('Invalid payload', { status: 400 }); 
    }

    switch(event.type) {
        case 'user.created':
            const user = await ctx.runQuery(internal.user.get, {
                clerkId: event.data.id,
            })
            if(user) {
                console.log(`updating user ${event.data.id} with ${event.data}`);
            }
            break;

        case 'user.updated':
            console.log(`user ${event.data.id} updated with ${event.data}`);

            await ctx.runMutation(internal.user.create, {
               username: `${event.data.first_name} ${event.data.last_name}`,
               imageUrl: event.data.image_url || '',
               clerkId: event.data.id,
               email: event.data.email_addresses[0].email_address || '',
            })
            break;

        default:
            console.log('Clerk webhook not supported', event.type);
            break;
    }

    return new Response('Webhook processed successfully',
         { status: 200 });
})

http.route({
    path: '/clerk-users-webhook',
    method: 'POST',
    handler: handleClerkWebhook
})
