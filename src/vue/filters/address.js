export function shortAddress(addr) {
    return addr.substr(0, 8) + '...' + addr.substr(addr.length-4);
}