const { statisticalDrops } = require('./drop_storage');
const affixes = require('./drop_affixes.json');

const folded = value => String(value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

function affixForms(value) {
    const forms = [value];
    if (value.endsWith('(a)')) {
        const masculine = value.slice(0, -3);
        forms.push(masculine, masculine.endsWith('o') ? masculine.slice(0, -1) + 'a' : masculine + 'a');
    }
    return forms.map(folded);
}
const affixAliases = new Map();
for (const entry of affixes) {
    for (const value of Object.values(entry).flatMap(affixForms)) affixAliases.set(value, folded(entry.en));
}
const affixKey = value => affixAliases.get(folded(value)) || folded(value);

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
    const filters = { search: text('search'), item_name: text('item_name', 192), id: number('id'), affix: text('affix'),
        upgrade: number('upgrade', true), slots: number('slots', true), days };
    filters.detailed = filters.id !== null || !!filters.affix || filters.upgrade !== null || filters.slots !== null;
    return filters;
}

function matches(drop, filters) {
    const contains = (value, needle) => folded(value).includes(folded(needle));
    return (!filters.search || contains(drop.name, filters.search) || contains(drop.base_name, filters.search)) &&
        (!filters.item_name || folded(drop.base_name || drop.name) === folded(filters.item_name)) &&
        (filters.id === null || drop.id === filters.id) &&
        (!filters.affix || (filters.affix === 'unknown' ? drop.affix === null :
            affixKey(drop.affix) === affixKey(filters.affix))) &&
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
            quantity: 0, total_quantity: 0, total_time: 0, timed_quantity: 0, timed_runs: 0,
            items: new Map(), item_names: new Set(),
        });
        const row = dungeons.get(run.dungeon);
        row.total_runs++;
        if (run.drop_tracking_complete === false) continue;
        if (filters.detailed && run.drop_details_tracked !== true) continue;
        row.runs++;
        const allDrops = statisticalDrops(run.drops);
        row.total_quantity += allDrops.reduce((sum, drop) => sum + drop.quantity, 0);
        for (const drop of allDrops) row.item_names.add(drop.base_name || drop.name);
        const drops = allDrops.filter(drop => matches(drop, filters));
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
        item_names: [...row.item_names].sort((a, b) => a.localeCompare(b)),
        items: [...row.items.values()].sort((a, b) => b.quantity - a.quantity || a.key.localeCompare(b.key)),
    })).sort((a, b) => a.dungeon.localeCompare(b.dungeon));
}

async function mergeLifetimeStats(rows, stats, filters) {
    // Lifetime aggregates cannot answer date windows or detail-coverage filters.
    if (filters.days !== null || filters.detailed) return rows;
    const merged = new Map(rows.map(row => [row.dungeon, row]));
    for await (const stat of stats) {
        if (typeof stat.dungeon !== 'string' || !Number.isSafeInteger(stat.runs) || stat.runs <= 0) continue;
        const current = merged.get(stat.dungeon);
        // Use one complete source per dungeon, never add aggregate and raw counts.
        if (current && stat.runs <= current.total_runs) continue;
        const all = statisticalDrops(stat.drops);
        const matching = all.filter(drop => matches(drop, filters));
        const items = new Map();
        for (const drop of matching) {
            const key = drop.id === null ? `legacy:${drop.name}` : `id:${drop.id}`;
            if (!items.has(key)) items.set(key, { key, id: drop.id, name: drop.base_name || drop.name,
                quantity: 0, matched_runs: null });
            items.get(key).quantity += drop.quantity;
        }
        merged.set(stat.dungeon, {
            dungeon: stat.dungeon, runs: stat.runs, total_runs: stat.runs,
            quantity: matching.reduce((sum, drop) => sum + drop.quantity, 0),
            total_quantity: all.reduce((sum, drop) => sum + drop.quantity, 0),
            matched_runs: null, total_time: stat.total_time || 0, source: 'lifetime_stats',
            item_names: [...new Set(all.map(drop => drop.base_name || drop.name))],
            items: [...items.values()].sort((a, b) => b.quantity - a.quantity || a.key.localeCompare(b.key)),
        });
    }
    return [...merged.values()].sort((a, b) => a.dungeon.localeCompare(b.dungeon));
}

module.exports = { parseFilters, summarizeReports, mergeLifetimeStats };
