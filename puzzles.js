// puzzles.js

// Compressed library of puzzles
export const rawNonogramLibrary = [
    {
        id: "smile-01",
        name: "Smile Emoji",
        difficulty: "Normal",
        // 15x15 grid compressed using RLE
        // e = empty (0), f = filled (1)
        compressedGrid: "4e7f4e,2e2f10e2f,1e1f13e1f,1e1f13e1f,1f2e2f8e2f2e1f,1f2e2f8e2f2e1f,1f14e1f,1f14e1f,1f2e1f10e1f2e1f,1f2e1f10e1f2e1f,1e1f3e7f3e1f,1e1f13e1f,2e2f9e2f,4e7f4e,15e"
    },
    {
        id: "heart-02",
        name: "Tiny Heart",
        difficulty: "Easy",
        compressedGrid: "15e,15e,15e,3e2f5e2f3e,2e4f3e4f2e,1e13f1e,1e13f1e,2e11f2e,3e9f3e,4e7f4e,5e5f5e,6e3f6e,7e1f7e,15e,15e"
    }
    // You can easily paste 100+ of these here and they will take up virtually zero space!
];

/**
 * Utility function to decompress our RLE string back into a 15x15 nested grid.
 * Example: "4e7f4e" -> [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0]
 */
export function decompressPuzzle(rleString) {
    const rows = rleString.split(',');
    return rows.map(rowStr => {
        const row = [];
        // Match groupings like "4e" or "10f"
        const matches = rowStr.match(/(\d+[ef])/g) || [];
        
        matches.forEach(token => {
            const length = parseInt(token.slice(0, -1));
            const type = token.slice(-1) === 'f' ? 1 : 0;
            for (let i = 0; i < length; i++) {
                row.push(type);
            }
        });
        return row;
    });
}