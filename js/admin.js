(function($) {

  "use strict";
let pedidos = [];

async function getPedidos(){
  try {
    const response = await fetch(
      `http://127.0.0.1:3010/pedidosA`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );


    const data = await response.json();
    console.log(data)
    pedidos= data;
    renderizarPedidos() 
    return
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return ;

  }
} 

window.renderizarPedidos = function() {
    const container = document.getElementById('contenedor-pedidos');
    const filtro = document.getElementById('filtroEstado').value;

    container.innerHTML = '';

    const pedidosFiltrados = filtro
        ? pedidos.filter(p => p.status === filtro)
        : pedidos;

    pedidosFiltrados.forEach(pedido => {

        const productosHTML = pedido.pedidoInividual.map(item => `
            <li class="list-group-item d-flex justify-content-between px-0 py-1 border-0">
                <span>${item.cantidad}x ${item.productName}</span>
                <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
            </li>
        `).join('');
        const total = pedido.pedidoInividual.reduce((acc, item) => {
            return acc + ((item.precio || 0) * (item.cantidad || 0));
        }, 0);   
        const comment = pedido.comment || '';
       
        const card = `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card shadow-sm h-100">

                <div class="card-body">

                    <!-- STATUS -->
                    <div class="border rounded text-center mb-2 py-1 fw-bold">
                        ${pedido.status || 'Sin estado'}
                    </div>

                    <!-- INFO PEDIDO -->
                    <small class="text-muted d-block">
                        ID: ${pedido._id.slice(-6).toUpperCase()}
                    </small>

                    <div class="mb-2">
                        <span class="badge bg-light text-dark border">${pedido.metodo}</span>
                        <span class="badge bg-light text-dark border">${pedido.fecha}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>${comment}</span>
                    </div>
                    <!-- USUARIO -->
                    <div class="mb-2 small">
                        <strong>${pedido.usuario?.name || 'Sin nombre'}</strong><br>
                        📧 ${pedido.usuario?.email || '-'}<br>
                        📞 ${pedido.usuario?.phone || '-'}<br>
                        📍 ${pedido.usuario?.address || '-'}
                    </div>

                    <!-- PRODUCTOS -->
                    <ul class="list-group mb-2 small">
                        ${productosHTML}
                    </ul>

                    <!-- TOTAL -->
                    <div class="d-flex justify-content-between">
                        <strong>Total</strong>
                        <strong>$${ total.toFixed(2) }</strong>
                    </div>

                    <!-- ACCIONES -->
                    <div class="d-flex gap-2 mt-3">
                        <button class="btn btn-sm btn-primary w-100"
                            onclick="cambiarEstado('${pedido._id}', 'Preparando')">
                            Preparar
                        </button>

                        <button class="btn btn-sm btn-success w-100"
                            onclick="cambiarEstado('${pedido._id}', 'Entregado')">
                            Entregar
                        </button>

                        <button class="btn btn-sm btn-danger w-100"
                            onclick="cambiarEstado('${pedido._id}', 'Cancelado')">
                            Cancelar
                        </button>
                    </div>

                </div>
            </div>
        </div>
        `;

        container.insertAdjacentHTML('beforeend', card);
    });
};
window.cambiarEstado = async function(id, nuevoEstado) {
    try {
        await fetch(`http://127.0.0.1:3010/api/pedidos/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: nuevoEstado })
        });


        await getPedidos()
        renderizarPedidos();

    } catch (err) {
        console.error("Error cambiando estado", err);
    }
};
  // document ready
$(document).ready(function() { 
    getPedidos()
    document.getElementById('filtroEstado').addEventListener('change', () => {
    renderizarPedidos();
});
  }); // End of a document

})(jQuery);