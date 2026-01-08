// src/background/notifications.js

export async function showNotification(reminderId, notificationId) {
    try {
        const { user_reminders } = await browser.storage.local.get('user_reminders');

        // Fetch presets
        const url = browser.runtime.getURL('src/data/presets.json');
        const response = await fetch(url);
        const presets = await response.json();

        let reminder = user_reminders?.find(r => r.id === reminderId);
        if (!reminder) {
            reminder = presets.find(r => r.id === reminderId);
        }

        // Firefox does NOT support 'buttons' or 'requireInteraction' in notifications
        const notificationOptions = {
            type: 'basic',
            iconUrl: browser.runtime.getURL('src/assets/icons/icon128.png'),
            title: 'مُذكِّر الوِرد اليومي',
            message: reminder ? `حان وقت قراءة: ${reminder.name}` : 'حان وقت وردك اليومي!'
        };

        await browser.notifications.create(notificationId, notificationOptions);
        console.log('Notification created:', notificationId);
    } catch (e) {
        console.error('Error in showNotification:', e);
    }
}
