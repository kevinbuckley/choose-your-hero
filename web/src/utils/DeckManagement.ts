export const cardWidth: number = 93;
export const cardHeight: number = 140;
export const cardMultiplier: number = .75;

export function getBaseURL(): string {
    // Check if the URL contains the '/boss-battles/' subdirectory
    if (window.location.pathname.includes('/boss-battles/')) {
        return '/boss-battles/';
    }
    return ''; // Return empty string for local development
}