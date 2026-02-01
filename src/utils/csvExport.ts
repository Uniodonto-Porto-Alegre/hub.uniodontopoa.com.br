export function exportToCSV(filename: string, data: any[]) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(';');
    const rows = data.map(obj =>
        Object.values(obj)
            .map(val => `"${String(val).replace(/"/g, '""')}"`)
            .join(';')
    );

    const csvContent = [headers, ...rows].join('\n');

    // Usar acentos corretos no Excel (BOM)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
