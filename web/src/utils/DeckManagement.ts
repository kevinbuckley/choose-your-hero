export const cardWidth: number = 90;
export const cardHeight: number = 130;
export const cardMultiplier: number = .8;

export function getBaseURL(): string {
    // Check if the URL contains the '/boss-battles/' subdirectory
    if (window.location.pathname.includes('/boss-battles/')) {
        return '/boss-battles/';
    }
    return ''; // Return empty string for local development
}