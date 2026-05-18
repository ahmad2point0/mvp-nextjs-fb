import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import {
  validateDonationAmount,
  ITEM_DELIVERY_CATEGORIES,
  REQUEST_CATEGORIES,
  type RequestCategory,
} from "@/features/donations/constants";
import { notifyAdmins } from "@/global/lib/create-notification";
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
  const scope = searchParams.get("scope"); // 'available' | 'mine'

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("aid_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (profile?.role === "admin") {
    // Admins see everything
  } else if (profile?.role === "donor") {
    if (scope === "mine") {
      // Donor's own accepted requests
      query = query.eq("accepted_donor_id", user.id);
    } else {
      // Default: broadcast view — pending + unassigned (or assigned to me)
      query = query
        .is("accepted_donor_id", null)
        .in("status", ["pending", "approved"]);
    }
  } else {
    // Student sees own requests
    query = query.eq("student_id", user.id);
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
    aid_type,
    amount,
    description,
    category,
    delivery_address,
    document_ids,
  } = body;

  if (!aid_type || !description) {
    return NextResponse.json(
      { error: "Aid type and description are required" },
      { status: 400 }
    );
  }

  if (
    !category ||
    !REQUEST_CATEGORIES.includes(category as RequestCategory)
  ) {
    return NextResponse.json(
      { error: `category must be one of ${REQUEST_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }

  const isItemCategory = ITEM_DELIVERY_CATEGORIES.has(category);

  if (isItemCategory) {
    if (!delivery_address || String(delivery_address).trim().length < 10) {
      return NextResponse.json(
        {
          error:
            "Delivery address is required for item donations (min 10 characters).",
        },
        { status: 400 }
      );
    }
  } else {
    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required for monetary categories" },
        { status: 400 }
      );
    }
    const amountError = validateDonationAmount(Number(amount));
    if (amountError) {
      return NextResponse.json({ error: amountError }, { status: 400 });
    }
  }

  if (!Array.isArray(document_ids) || document_ids.length === 0) {
    return NextResponse.json(
      {
        error:
          "At least one supporting document is required before submitting this request.",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("aid_requests")
    .insert({
      student_id: user.id,
      aid_type,
      category,
      amount: isItemCategory ? 0 : Number(amount),
      description,
      delivery_address: isItemCategory ? String(delivery_address).trim() : null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  /* Attach the uploaded documents to this request. */
  if (document_ids.length > 0) {
    await supabase
      .from("documents")
      .update({ aid_request_id: data.id })
      .in("id", document_ids as string[])
      .eq("user_id", user.id);
  }

  await notifyAdmins(
    supabase,
    "New aid request submitted",
    `A new ${category} request requires document verification.`,
    "clipboard-list"
  );

  return NextResponse.json(data, { status: 201 });
}
