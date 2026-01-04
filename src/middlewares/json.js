  export async function json(req, res) {
    if (req.method === "GET" || req.method === "DELETE") {
      req.body = {};
      return;
    }

    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    if (buffers.length === 0) {
      req.body = {};
      return;
    }

    try {
      req.body = JSON.parse(Buffer.concat(buffers).toString());
    } catch {
      req.body = null;
    }

    res.setHeader("Content-type", "application/json");
  }
