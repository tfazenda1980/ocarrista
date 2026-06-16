import { NextResponse } from "next/server";
import { getChallengerLiveData } from "@/app/lib/challenger/repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ year: string }> },
) {
  const { year } = await context.params;
  const data = await getChallengerLiveData(year);
  return NextResponse.json(data);
}
