// functions/api/transactions.js
// Cloudflare Pages Function for Transaction CRUD operations on D1

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
  "Content-Type": "application/json"
};

// CORS preflight options handler
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

// Helper to check admin passcode
function isAuthorized(request, env) {
  const clientPassword = request.headers.get("X-Admin-Password");
  const adminPassword = env.AUTH_PASSCODE || env.ADMIN_PASSWORD || "20147";
  return clientPassword && String(clientPassword).trim() === String(adminPassword).trim();
}

// GET: Retrieve transactions with filters
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  const type = url.searchParams.get("type");
  const category = url.searchParams.get("category");
  const platform = url.searchParams.get("platform");
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const search = url.searchParams.get("search");
  
  let query = "SELECT * FROM transactions WHERE 1=1";
  const params = [];
  
  if (type) {
    query += " AND type = ?";
    params.push(type);
  }
  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  if (platform) {
    query += " AND platform = ?";
    params.push(platform);
  }
  if (startDate) {
    query += " AND date >= ?";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND date <= ?";
    params.push(endDate);
  }
  if (search) {
    query += " AND (location LIKE ? OR remark LIKE ? OR category LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  query += " ORDER BY date DESC, updated_at DESC";
  
  try {
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// POST: Add new transaction
export async function onRequestPost(context) {
  const { env, request } = context;
  
  if (!isAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: "รหัสผ่านไม่ถูกต้อง" }), {
      status: 401,
      headers: corsHeaders
    });
  }
  
  try {
    const data = await request.json();
    const { id, date, type, platform, total, category, location, remark } = data;
    
    if (!date || !type || !platform || total === undefined || !category) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: corsHeaders
      });
    }
    
    // Generate unique ID if none is supplied
    const txnId = id || crypto.randomUUID();
    const updatedAt = Date.now();
    
    await env.DB.prepare(
      `INSERT OR REPLACE INTO transactions (id, date, type, platform, total, category, location, remark, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      txnId,
      date,
      type,
      platform,
      parseFloat(total),
      category,
      location || "",
      remark || "",
      updatedAt
    ).run();
    
    const txn = { id: txnId, date, type, platform, total: parseFloat(total), category, location, remark, updated_at: updatedAt };
    
    return new Response(JSON.stringify({ success: true, transaction: txn }), {
      status: 201,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// PUT: Update existing transaction
export async function onRequestPut(context) {
  const { env, request } = context;
  
  if (!isAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: "รหัสผ่านไม่ถูกต้อง" }), {
      status: 401,
      headers: corsHeaders
    });
  }
  
  try {
    const data = await request.json();
    const { id, date, type, platform, total, category, location, remark } = data;
    
    if (!id || !date || !type || !platform || total === undefined || !category) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: corsHeaders
      });
    }
    
    const updatedAt = Date.now();
    
    const result = await env.DB.prepare(
      `UPDATE transactions 
       SET date = ?, type = ?, platform = ?, total = ?, category = ?, location = ?, remark = ?, updated_at = ?
       WHERE id = ?`
    ).bind(
      date,
      type,
      platform,
      parseFloat(total),
      category,
      location || "",
      remark || "",
      updatedAt,
      id
    ).run();
    
    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: "Transaction not found" }), {
        status: 404,
        headers: corsHeaders
      });
    }
    
    const txn = { id, date, type, platform, total: parseFloat(total), category, location, remark, updated_at: updatedAt };
    
    return new Response(JSON.stringify({ success: true, transaction: txn }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// DELETE: Remove transaction
export async function onRequestDelete(context) {
  const { env, request } = context;
  
  if (!isAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: "รหัสผ่านไม่ถูกต้อง" }), {
      status: 401,
      headers: corsHeaders
    });
  }
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing ID parameter" }), {
        status: 400,
        headers: corsHeaders
      });
    }
    
    const result = await env.DB.prepare("DELETE FROM transactions WHERE id = ?").bind(id).run();
    
    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: "Transaction not found" }), {
        status: 404,
        headers: corsHeaders
      });
    }
    
    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
