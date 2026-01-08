// src/background/background.js
import { showNotification } from './notifications.js';

// --- Initialization ---

browser.runtime.onInstalled.addListener(async () => {
    console.log('Extension installed. Initializing...');

    // Initialize storage if empty
    const { user_reminders } = await browser.storage.local.get('user_reminders');
    if (!user_reminders) {
        await browser.storage.local.set({ user_reminders: [] });
    }

    // Fetch and store Surah metadata
    await fetchAndStoreSurahMetadata();
});

async function fetchAndStoreSurahMetadata() {
    try {
        const res = await fetch('https://api.quran.com/api/v4/chapters');
        const data = await res.json();
        const metadata = {};
        data.chapters.forEach(c => {
            metadata[c.id] = c.name_arabic;
        });
        await browser.storage.local.set({ surah_metadata: metadata });
        console.log('Surah metadata cached:', Object.keys(metadata).length, 'chapters');
    } catch (e) {
        console.error('Failed to cache Surah metadata:', e);
    }
}

// --- Alarm Listener ---

browser.alarms.onAlarm.addListener(async (alarm) => {
    console.log('Alarm fired:', alarm.name);

    if (alarm.name.startsWith('reminder_')) {
        const reminderId = alarm.name.replace('reminder_', '');
        await showNotification(reminderId, alarm.name);
    }
});

// --- Notification Click Listener (Firefox uses onClicked, not onButtonClicked) ---

browser.notifications.onClicked.addListener(async (notificationId) => {
    console.log('Notification clicked:', notificationId);
    if (notificationId.startsWith('reminder_')) {
        const reminderId = notificationId.replace('reminder_', '');

        // Open Reader in new tab
        const url = browser.runtime.getURL(`src/reader/reader.html?reminderId=${reminderId}`);
        browser.tabs.create({ url });

        // Clear the notification after clicking
        browser.notifications.clear(notificationId);
    }
});
