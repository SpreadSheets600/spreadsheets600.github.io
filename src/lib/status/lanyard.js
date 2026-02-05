const clients = new Map();

function createClient(userId) {
  let ws = null;
  let heartbeatInterval = null;
  let reconnectTimeout = null;
  let presence = null;
  const listeners = new Set();

  const notify = (event, payload) => {
    listeners.forEach((listener) => {
      const handler = listener?.[event];
      if (typeof handler === "function") handler(payload);
    });
  };

  const fetchPresence = async () => {
    try {
      const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
      const data = await response.json();
      if (!data.success) throw new Error("Lanyard API error");
      presence = data.data;
      notify("onPresence", presence);
      return presence;
    } catch (err) {
      notify("onError", err);
      throw err;
    }
  };

  const connect = () => {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    ws = new WebSocket("wss://api.lanyard.rest/socket");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.op) {
        case 1:
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          heartbeatInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ op: 3 }));
            }
          }, data.d.heartbeat_interval);

          ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
          break;
        case 0:
          if (data.t === "INIT_STATE" || data.t === "PRESENCE_UPDATE") {
            presence = data.d;
            notify("onPresence", presence);
          }
          break;
      }
    };

    ws.onclose = () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (listeners.size > 0) {
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    ws.onerror = (err) => {
      notify("onError", err);
      ws.close();
    };
  };

  const start = () => {
    fetchPresence().catch(() => {});
    connect();
  };

  const stop = () => {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (ws) ws.close();
    ws = null;
  };

  return {
    userId,
    listeners,
    getPresence: () => presence,
    start,
    stop,
    refresh: fetchPresence,
  };
}

function getClient(userId) {
  if (!clients.has(userId)) {
    clients.set(userId, createClient(userId));
  }
  return clients.get(userId);
}

export function subscribeToLanyard(userId, handlers) {
  if (!userId) throw new Error("userId is required");
  const client = getClient(userId);
  client.listeners.add(handlers);

  if (client.listeners.size === 1) {
    client.start();
  }

  const current = client.getPresence();
  if (current) handlers?.onPresence?.(current);

  return () => {
    client.listeners.delete(handlers);
    if (client.listeners.size === 0) {
      client.stop();
    }
  };
}

export function refreshLanyard(userId) {
  if (!userId) throw new Error("userId is required");
  const client = getClient(userId);
  return client.refresh();
}
