import { superdevClient } from "@/lib/superdev/client";

export const Creative = superdevClient.entity("Creative");
export const CreditTransaction = superdevClient.entity("CreditTransaction");
export const Project = superdevClient.entity("Project");
export const User = superdevClient.auth;
