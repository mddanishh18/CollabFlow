import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";


const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
});

export default function LoginForm() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }))
        }
    };

    const validateForm = () => {
        try {
            loginSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0]] = err.message;
                    }
                })
                setErrors(fieldErrors);
            }
            return false;
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post("/api/auth/login", formData);

            if (response.success) {
                const { user, token } = response.data;
                login(user, token);
                router.push("/workspace");
            }
        } catch (error) {
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-sm sm:max-w-md w-full">
                <Card className="bg-card text-card-foreground rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8 border border-border">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div className="text-center mb-6 sm:mb-8">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                                Login
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Sign in to get started
                            </p>
                        </div>

                        {apiError && (
                            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm">
                                {apiError}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-foreground font-medium text-sm sm:text-base block">
                                Email
                            </Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full h-10 sm:h-11 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring text-sm sm:text-base"
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="text-destructive text-xs sm:text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-foreground font-medium text-sm sm:text-base block">
                                Password
                            </Label>
                            <Input
                                type="password"
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full h-10 sm:h-11 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring text-sm sm:text-base"
                                placeholder="Enter your password"
                            />
                            {errors.password && (
                                <p className="text-destructive text-xs sm:text-sm mt-1">{errors.password}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-10 sm:h-11 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium mt-6"
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>

                        <p className="text-sm sm:text-base text-muted-foreground mt-4">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-primary hover:underline">
                                Register
                            </Link>
                        </p>
                    </form>
                </Card>
            </div>
        </div>
    )
}
