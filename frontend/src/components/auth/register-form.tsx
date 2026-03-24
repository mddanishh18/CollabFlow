'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { motion, useReducedMotion } from 'framer-motion'
import { Input } from '../ui/input'
import { Label } from '@radix-ui/react-label'
import { Button } from '../ui/button'
import { useAuthStore } from '@/store/auth-store'
import { api } from '@/lib/api'

const registerSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
})

type RegisterFormData = z.infer<typeof registerSchema>
type FormErrors = Partial<Record<keyof RegisterFormData, string>>

export default function RegisterForm() {
    const router = useRouter()
    const register = useAuthStore((state) => state.register)
    const shouldReduceMotion = useReducedMotion()

    const [formData, setFormData] = useState<RegisterFormData>({
        name: '',
        email: '',
        password: '',
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        if (errors[name as keyof RegisterFormData]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }))
        }
    }

    const validateForm = (): boolean => {
        try {
            registerSchema.parse(formData)
            setErrors({})
            return true
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: FormErrors = {}
                error.issues.forEach((err: z.ZodIssue) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as keyof RegisterFormData] = err.message
                    }
                })
                setErrors(fieldErrors)
            }
            return false
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setApiError('')

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            const response = await api.post('/api/auth/register', formData)

            if (response.success) {
                const { user, token } = response.data
                register(user, token)
                router.push('/workspace')
            }
        } catch (error) {
            setApiError((error as Error).message || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
            <div className="mb-8">
                <h2
                    className="text-2xl font-bold text-foreground mb-1.5"
                    style={{ letterSpacing: '-0.02em' }}
                >
                    Create your account.
                </h2>
                <p className="text-sm text-muted-foreground">
                    Free during beta. No credit card required.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {apiError && (
                    <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                        {apiError}
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label
                        htmlFor="name"
                        className="text-sm font-medium text-foreground block"
                    >
                        Name
                    </Label>
                    <Input
                        type="text"
                        id="name"
                        name="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
                        placeholder="Your name"
                    />
                    {errors.name && (
                        <p className="text-destructive text-xs mt-1">{errors.name}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground block"
                    >
                        Email
                    </Label>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
                        placeholder="you@example.com"
                    />
                    {errors.email && (
                        <p className="text-destructive text-xs mt-1">{errors.email}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label
                        htmlFor="password"
                        className="text-sm font-medium text-foreground block"
                    >
                        Password
                    </Label>
                    <Input
                        type="password"
                        id="password"
                        name="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full h-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
                        placeholder="At least 6 characters"
                    />
                    {errors.password && (
                        <p className="text-destructive text-xs mt-1">{errors.password}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 mt-2"
                >
                    {isLoading ? 'Creating account…' : 'Create account'}
                </Button>

                <p className="text-sm text-muted-foreground text-center pt-1">
                    Already have an account?{' '}
                    <Link href="/login" className="text-foreground hover:text-primary transition-colors font-medium">
                        Sign in
                    </Link>
                </p>
            </form>
        </motion.div>
    )
}
