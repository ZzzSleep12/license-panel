import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const form = await req.formData();
  const id = Number(form.get("id"));
  if (!id) return NextResponse.redirect("/admin");
  await supabaseAdmin.from("licenses").update({ revoked: true }).eq("id", id);
  return NextResponse.redirect("/admin");
}
