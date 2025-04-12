// 16种颜色配置
const COLORS = [
    '#737171', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FF8000', '#8000FF',
    '#0080FF', '#FF0080', '#80FF00', '#00FF80',
    '#800000', '#008000', '#000080',
];

// 关卡设计：值 = 16*颜色下标 + 撞击次数
const levels = [
    [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 145, 145, 145, 145, 145, 1],
        [1, 145, 1, 145, 1, 145, 1],
        [1, 145, 1, 145, 1, 145, 1],
        [1, 145, 1, 145, 1, 145, 1]
    ],

];

// 颜色和撞击次数解码函数
function decodeBlockValue(value) {
    if (value === 0) return null;
    const colorIndex = Math.floor(value / 16);
    const hits = value % 16;

    if (colorIndex === 0) {
        return {
            color: COLORS[colorIndex % COLORS.length],
            maxHits: Infinity, // 永远不会被破坏
            hits: 0,
            indestructible: true
        };
    }

    return {
        color: COLORS[colorIndex % COLORS.length],
        maxHits: hits,
        hits: 0,
        indestructible: false
    };
}
