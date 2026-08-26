export function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
        y: 31536000,
        mo: 2592000,
        w: 604800,
        d: 86400,
        h: 3600,
        m: 60,
        s: 1,
    };

    for (const interval in intervals) {
        const value = Math.floor(seconds / intervals[interval]);
        if (value > 0) {
            return `${value}${interval} ago`;
        }
    }

    return "just now";
}