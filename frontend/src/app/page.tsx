import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_SKIP_AUTH === "true"
  ) {
    redirect("/api/auth/dev-login");
  }

  const session = await auth();
  if (session) {
    redirect("/boards");
  } else {
    redirect("/login");
  }
}
