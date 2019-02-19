export function shortAddress(addr, maxlength=12) {
    addr = '' + addr;
    if (!addr) return 'Contract Creation';
    if (addr.length <= 12) return addr;
    if (addr.length > maxlength) return addr.substr(0, maxlength) + '...';
    return addr;
}