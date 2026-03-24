import RegisterForm from '@/components/auth/register-form'
import { ThemeToggle } from '@/components/theme/theme-toggle'

const features = [
    'Real-time project workspaces',
    'Full message history and search',
    'AI assistant per project — Q2 2026',
    'Free during beta',
]

export default function RegisterPage() {
    return (
        <div className="min-h-dvh grid lg:grid-cols-2">
            {/* Left: Branding panel — hidden on mobile */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-muted/30 border-r border-border">
                <div>
                    <div className="flex items-center gap-3 mb-14">
                        <div className="w-7 h-7 rounded-md bg-primary flex-shrink-0" />
                        <span className="font-semibold text-foreground">Workspace</span>
                    </div>
                    <div className="max-w-sm">
                        <h1
                            className="text-3xl font-bold text-foreground mb-4"
                            style={{ letterSpacing: '-0.02em' }}
                        >
                            Your team&apos;s
                            <br />
                            second brain.
                        </h1>
                        <p className="text-muted-foreground leading-relaxed mb-10 text-sm">
                            Every decision, conversation, and task — searchable,
                            organized, and available to AI assistants that know
                            exactly your project&apos;s context.
                        </p>
                        <ul className="space-y-3">
                            {features.map((item) => (
                                <li
                                    key={item}
                                    className="flex items-center gap-3 text-sm text-muted-foreground"
                                >
                                    <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} Workspace. All rights reserved.
                </p>
            </div>

            {/* Right: Form panel */}
            <div className="relative flex items-center justify-center p-6 sm:p-12">
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                    <ThemeToggle />
                </div>
                <div className="w-full max-w-sm">
                    <RegisterForm />
                </div>
            </div>
        </div>
    )
}
