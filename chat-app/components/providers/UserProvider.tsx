'use client'

import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useEffect } from 'react'

export default function UserProvider() {
    const { user } = useUser()
    const createOrUpdateUser = useMutation(api.user.createOrUpdateUser)

    useEffect(() => {
        if (user) {
            createOrUpdateUser({
                username: user.username || user.firstName || 'Anonymous',
                imageUrl: user.imageUrl,
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress
            })
        }
    }, [user, createOrUpdateUser])

    return null
} 