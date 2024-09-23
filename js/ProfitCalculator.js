function calculateProfit() {
    const quantity = document.getElementById('quantity').value;
    const purchasePrice = document.getElementById('purchasePrice').value;
    const salePrice = document.getElementById('salePrice').value;
    const product = document.getElementById('productName').value
    

    const totalPurchase = quantity * purchasePrice;
    const totalSale = quantity * salePrice;
    const profit = totalSale - totalPurchase;

    Swal.fire({
        title: `Ganancias: ${profit} pesos`,
        text: ` se ha generado tus ganancias por el producto ${product} .`,
        icon: 'success'
    }).then(() => {
        // Limpiar el formulario
        document.getElementById('productName').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('purchasePrice').value = '';
        document.getElementById('salePrice').value = '';
    });
}
