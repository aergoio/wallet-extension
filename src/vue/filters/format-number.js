export function formatNumber(value, sep=" ", sepDecimal="") {
    const parts = value.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    if (parts.length > 1) {
        const rev = s => s.split('').reverse().join('');
        parts[1] = rev(rev(parts[1]).replace(/\B(?=(\d{3})+(?!\d))/g, sepDecimal));
    }
    return parts.join(".");
}