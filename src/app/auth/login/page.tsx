/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/lib/auth";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      Cookies.set("access_token", data.accessToken);
      toast.success("Logged in successfully");
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    }
  });

  const onSubmit = (values: LoginFormData) => mutation.mutate(values);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input {...register("email")} placeholder="Email" className="w-full border p-2 rounded" />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <input {...register("password")} type="password" placeholder="Password" className="w-full border p-2 rounded" />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={mutation.isPending} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          {mutation.isPending ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6">
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center justify-center gap-2 w-full border p-2 rounded hover:bg-gray-100"
        >
          <FcGoogle size={20} /> Continue with Google
        </button>
      </div>
    </div>
  );
}
