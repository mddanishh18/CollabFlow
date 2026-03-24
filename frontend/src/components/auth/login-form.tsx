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

const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>
type FormErrors = Partial<Record<keyof LoginFormData, string>>

export default function LoginForm() {
    const router = useRouter()
    const login = useAuthStore((state) => state.login)
    const shouldReduceMotion = useReducedMotion()

    const [formData, setFormData] = useState<LoginFormData>({
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

        if (errors[name as keyof LoginFormData]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }))
        }
    }

    const validateForm = (): boolean => {
        try {
            loginSchema.parse(formData)
            setErrors({})
            return true
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: FormErrors = {}
                error.issues.forEach((err: z.ZodIssue) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as keyof LoginFormData] = err.message
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
            const response = await api.post('/api/auth/login', formData)

            if (response.success) {
                const { user, token } = response.data
                login(user, token)
                router.push('/workspace')
            }
        } catch (error) {
            setApiError((error as Error).message)
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
                    Welcome back.
                </h2>
                <p className="text-sm text-muted-foreground">
                    Sign in to your account to continue.
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
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full h-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
                        placeholder="Your password"
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
                    {isLoading ? 'Signing in…' : 'Sign in'}
                </Button>

                <p className="text-sm text-muted-foreground text-center pt-1">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-foreground hover:text-primary transition-colors font-medium">
                        Create one
                    </Link>
                </p>
            </form>
        </motion.div>
    )
}
