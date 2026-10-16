import { NextResponse } from "next/server";
import { DomainError } from "./contracts";

export function apiError(error: unknown) {
  if (error instanceof DomainError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: { code: "INTERNAL", message: "Something went wrong." } }, { status: 500 });
}
