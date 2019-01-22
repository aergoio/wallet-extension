export function shortAddress(addr) {
    addr = '' + addr;
    return addr.substr(0, 8) + '...' + addr.substr(addr.length-4);
}