// Shared storage rules for run reports and cumulative statistics.
const DETAIL_FIELDS = ['affix', 'affix_status', 'affix_tier', 'affix_variant',
    'affix_localization_key', 'upgrade', 'slots', 'stackable'];

function normalizeDrops(drops) {
    const grouped = new Map();
    for (const value of Array.isArray(drops) ? drops : []) {
        const drop = typeof value === 'string' ? { name: value } : value;
        if (!drop || typeof drop.name !== 'string' || !drop.name.trim()) continue;
        const quantity = drop.quantity !== undefined ? drop.quantity
            : (drop.count !== undefined ? drop.count : 1);
        if (!Number.isSafeInteger(quantity) || quantity <= 0) continue;
        const item = {
            id: Number.isSafeInteger(drop.id) && drop.id > 0 ? drop.id : null,
            name: drop.name.trim(),
            base_name: typeof drop.base_name === 'string' && drop.base_name.trim()
                ? drop.base_name.trim() : null,
        };
        for (const field of DETAIL_FIELDS) {
            const v = drop[field];
            item[field] = ['upgrade', 'slots', 'affix_variant'].includes(field)
                ? (Number.isSafeInteger(v) && v >= 0 ? v : null)
                : field === 'stackable' ? (typeof v === 'boolean' ? v : null)
                : (typeof v === 'string' && v.trim() ? v.trim() : null);
        }
        // IDs survive localization changes. Unknown legacy IDs stay separate.
        item.key = item.id === null && DETAIL_FIELDS.every(f => item[f] === null)
            ? `legacy:${item.name}`
            : JSON.stringify([item.id, item.id === null ? item.name : null,
                ...DETAIL_FIELDS.map(f => item[f])]);
        const existing = grouped.get(item.key);
        const total = (existing?.quantity || 0) + quantity;
        if (!Number.isSafeInteger(total)) throw new RangeError('Drop quantity exceeds safe integer range');
        grouped.set(item.key, { ...item, quantity: total, count: total });
    }
    return [...grouped.values()];
}

function statsUpdate(appUser, dungeon, duration, drops) {
    return [{ $set: {
        app_user: { $literal: appUser },
        dungeon: { $literal: dungeon },
        drop_schema_version: 2,
        runs: { $add: [{ $ifNull: ['$runs', 0] }, 1] },
        total_time: { $add: [{ $ifNull: ['$total_time', 0] }, duration] },
        drops: { $reduce: {
            input: { $literal: drops },
            initialValue: { $map: {
                input: { $ifNull: ['$drops', []] }, as: 'old',
                in: { $mergeObjects: [
                    { id: null, ...Object.fromEntries(DETAIL_FIELDS.map(f => [f, null])) },
                    '$$old',
                    { key: { $ifNull: ['$$old.key', { $concat: ['legacy:', '$$old.name'] }] },
                        quantity: { $ifNull: ['$$old.quantity', '$$old.count'] } },
                ] },
            } },
            in: { $cond: [
                { $in: ['$$this.key', { $map: { input: '$$value', as: 'old', in: '$$old.key' } }] },
                { $map: { input: '$$value', as: 'old', in: { $cond: [
                    { $eq: ['$$old.key', '$$this.key'] },
                    { $mergeObjects: ['$$old', '$$this', {
                        quantity: { $add: ['$$old.quantity', '$$this.quantity'] },
                        count: { $add: ['$$old.quantity', '$$this.quantity'] },
                    }] },
                    '$$old',
                ] } } },
                { $concatArrays: ['$$value', ['$$this']] },
            ] },
        } },
    } }];
}

module.exports = { normalizeDrops, statsUpdate };
