import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const filePath = join(process.cwd(), "public", "test-notification.html");
    const fileContent = readFileSync(filePath, "utf-8");
    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    return new NextResponse("Test page not found", { status: 404 });
  }
}


