import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";

// Zod validation schema
const registerSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
});

export default function RegisterForm() {
    const router = useRouter();
    const register = useAuthStore((state) => state.register);

    const [formData, setFormData] = useState({
        name: "",
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
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        try {
            registerSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(fieldErrors);
            }
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post("/api/auth/register", formData);

            if (response.success) {
                const { user, token } = response.data;
                register(user, token);
                router.push("/workspace");
            }
        } catch (error) {
            setApiError(error.message || "Registration failed. Please try again.");
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
                                Create Account
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Sign up to get started
                            </p>
                        </div>

                        {apiError && (
                            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm">
                                {apiError}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-foreground font-medium text-sm sm:text-base block">
                                Name
                            </Label>
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                autoComplete="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full h-10 sm:h-11 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring text-sm sm:text-base"
                                placeholder="Enter your name"
                            />
                            {errors.name && (
                                <p className="text-destructive text-xs sm:text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

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
                                autoComplete="new-password"
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
                            {isLoading ? "Creating account..." : "Register"}
                        </Button>

                        <div className="mt-4 sm:mt-6 text-center">
                            <p className="text-muted-foreground text-xs sm:text-sm">
                                Already have an account?{" "}
                                <a
                                    href="/login"
                                    className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                                >
                                    Sign in
                                </a>
                            </p>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
