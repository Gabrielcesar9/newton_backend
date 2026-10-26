const { normalizeDrops } = require('./drop_storage');

function parseFilters(query) {
    const text = (field, max = 120) => {
        const value = query[field] ?? '';
        if (typeof value !== 'string' || value.length > max) throw new Error(`Invalid ${field}`);
        return value.trim();
    };
    const number = (field, unknown = false) => {
        const value = text(field, 16);
        if (!value) return null;
        if (unknown && value === 'unknown') return value;
        if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error(`Invalid ${field}`);
        return Number(value);
    };
    const days = number('days');
    if (days !== null && ![7, 30, 90].includes(days)) throw new Error('Invalid days');
    const filters = { search: text('search'), id: number('id'), affix: text('affix'),
        upgrade: number('upgrade', true), slots: number('slots', true), days };
    filters.detailed = filters.id !== null || !!filters.affix || filters.upgrade !== null || filters.slots !== null;
    return filters;
}

function matches(drop, filters) {
    const contains = (value, needle) => String(value || '').toLocaleLowerCase().includes(needle.toLocaleLowerCase());
    return (!filters.search || contains(drop.name, filters.search)) &&
        (filters.id === null || drop.id === filters.id) &&
        (!filters.affix || (filters.affix === 'unknown' ? drop.affix === null :
            String(drop.affix || '').toLocaleLowerCase() === filters.affix.toLocaleLowerCase())) &&
        ['upgrade', 'slots'].every(field => filters[field] === null ||
            (filters[field] === 'unknown' ? drop[field] === null : drop[field] === filters[field]));
}

// Stream private run reports: memory grows with item types, not the number of runs.
async function summarizeReports(reports, filters) {
    const dungeons = new Map();
    for await (const run of reports) {
        if (typeof run.dungeon !== 'string') continue;
        if (!dungeons.has(run.dungeon)) dungeons.set(run.dungeon, {
            dungeon: run.dungeon, total_runs: 0, runs: 0, matched_runs: 0,
            quantity: 0, total_time: 0, timed_quantity: 0, timed_runs: 0, items: new Map(),
        });
        const row = dungeons.get(run.dungeon);
        row.total_runs++;
        if (run.drop_tracking_complete === false) continue;
        if (filters.detailed && run.drop_details_tracked !== true) continue;
        row.runs++;
        const drops = normalizeDrops(run.drops).filter(drop => matches(drop, filters));
        const quantity = drops.reduce((sum, drop) => sum + drop.quantity, 0);
        row.quantity += quantity;
        if (quantity > 0) row.matched_runs++;
        const timed = Number.isFinite(run.duration) && run.duration > 0;
        if (timed) {
            row.total_time += run.duration;
            row.timed_quantity += quantity;
            row.timed_runs++;
        }
        const perItem = new Map();
        for (const drop of drops) {
            // Roll variants into their base item after applying variant filters.
            const key = drop.id === null ? `legacy:${drop.name}` : `id:${drop.id}`;
            if (!perItem.has(key)) perItem.set(key, {
                key, id: drop.id, name: drop.base_name || drop.name, quantity: 0,
            });
            perItem.get(key).quantity += drop.quantity;
        }
        for (const [key, item] of perItem) {
            if (!row.items.has(key)) row.items.set(key, { ...item, quantity: 0, matched_runs: 0 });
            const total = row.items.get(key);
            total.quantity += item.quantity;
            total.matched_runs++;
        }
    }
    return [...dungeons.values()].map(row => ({ ...row,
        items: [...row.items.values()].sort((a, b) => b.quantity - a.quantity || a.key.localeCompare(b.key)),
    })).sort((a, b) => a.dungeon.localeCompare(b.dungeon));
}

module.exports = { parseFilters, summarizeReports };
