import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { createNotification, notifyAdmins } from "@/global/lib/create-notification";
import { validateDonationAmount } from "@/features/donations/constants";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");

  let query = supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    query = query.eq("donor_id", user.id);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    category,
    subcategory,
    amount,
    beneficiary_id,
    aid_request_id,
    payment_method,
    transaction_id,
    message,
    receipt_url,
  } = body;

  if (!category || !payment_method) {
    return NextResponse.json(
      { error: "Category and payment method are required" },
      { status: 400 }
    );
  }

  /* Amount is optional for in-kind / item donations now, since admin views
     are application-based and item donations use the delivery address. */
  let numericAmount: number | null = null;
  if (amount !== undefined && amount !== null && amount !== "") {
    numericAmount = Number(amount);
    const amountError = validateDonationAmount(numericAmount);
    if (amountError) {
      return NextResponse.json({ error: amountError }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("donations")
    .insert({
      donor_id: user.id,
      category,
      subcategory: subcategory || null,
      amount: numericAmount ?? 0,
      beneficiary_id: beneficiary_id || null,
      aid_request_id: aid_request_id || null,
      payment_method,
      transaction_id: transaction_id || null,
      message: message || null,
      receipt_url: receipt_url || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (aid_request_id) {
    const { data: aidRequest } = await supabase
      .from("aid_requests")
      .update({ status: "fulfilled" })
      .eq("id", aid_request_id)
      .select("student_id")
      .single();

    if (aidRequest?.student_id) {
      await createNotification(
        supabase,
        aidRequest.student_id,
        "Aid request fulfilled",
        "Your aid request has been funded by a donor.",
        "check-circle"
      );
    }
  }

  await notifyAdmins(
    supabase,
    "New donation received",
    "A new donation has been submitted and is pending review.",
    "dollar-sign"
  );

  return NextResponse.json(data, { status: 201 });
}
