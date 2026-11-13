self.addEventListener('push', event => {
  let message = {};
  try { message = event.data ? event.data.json() : {}; } catch (_) {}
  const title = message.title || 'Maná Fit House';
  const options = {
    body: message.body || 'Você tem uma atualização sobre seu pedido.',
    icon: '/shared/logo-round.png',
    badge: '/shared/logo-round.png',
    tag: message.tag || 'mana-fit-notification',
    renotify: true,
    data: { url: message.url || '/cliente/?tab=orders' },
    vibrate: [200, 100, 200],
  };
  event.waitUntil((async () => {
    const pages = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const visible = pages.find(page => page.visibilityState === 'visible');
    if (visible) {
      visible.postMessage({ type: 'mana-fit-push', title, body: options.body });
      return;
    }
    await self.registration.showNotification(title, options);
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/cliente/', self.location.origin).href;
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});
