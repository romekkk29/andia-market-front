(function($) {

  "use strict";
let productos = [];
let carrito = [];

let usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario_google')) || null;
if(usuarioLogueado){
  getUserT()
}
async function getUserT(){
      const user = await getUser(usuarioLogueado.email);
      console.log(user)
      const name = document.getElementById('cliente-nombre')
      if (name && user.name) {
          name.value = user.name;
      }
      const phone = document.getElementById('cliente-telefono')
      if (phone && user.phone) {
          phone.value = user.phone;
      }          
      const address = document.getElementById('cliente-direccion')
      if (address && user.address) {
          address.value = user.address;
      } 
} 
async function getProducts(){
  try {
    const response = await fetch(
      `http://127.0.0.1:3010/products`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error al obtener usuario:", errorText);
      return ;
    }

    const data = await response.json();
    productos= data;
    renderizarProductos()
    return
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return ;

  }
} 
window.agregarAlCarrito = function(id) {
  const productoEncontrado = productos.find(p => p.id === id);
  
  // Capturar la cantidad real del input de la card
  // Buscamos el input dentro de la card que corresponde a este producto
const botonPresionado = document.querySelector(`button[onclick="agregarAlCarrito(${id})"]`);
const cantidadInput = botonPresionado.closest('.product-item').querySelector('input[name="quantity"]').value;
  const nuevoItem = {
    ...productoEncontrado,
    cantidad: parseFloat(cantidadInput) || 1 
  };

  // Lógica para no repetir productos: si ya existe, sumamos cantidad
  const existe = carrito.find(item => item.id === id);
  if (existe) {
    existe.cantidad += nuevoItem.cantidad;
  } else {
    carrito.push(nuevoItem);
  }

  actualizarCarritoHTML();
 // --- LÍNEA PARA ABRIR EL CARRITO AUTOMÁTICAMENTE ---
  const myOffcanvas = document.getElementById('offcanvasCart');
  const openedCanvas = bootstrap.Offcanvas.getOrCreateInstance(myOffcanvas);
  openedCanvas.show(); 
};

window.eliminarDelCarrito = function(index) {
  carrito.splice(index, 1);
  actualizarCarritoHTML();
};
window.actualizarGrasa = function(index, valor) {
    if (carrito[index]) {
        carrito[index].quitaGrasa = valor + "%";

    }
};
window.actualizarCarritoHTML = function() {
const cartList = document.getElementById('cart-list');
  const cartCount = document.getElementById('cart-count');
  const cartTotalOffcanvas = document.getElementById('cart-total'); // El del lateral
  const cartTotalHeader = document.getElementById('header-cart-total'); // EL NUEVO (Header)
    if(!cartList) return;

  cartList.innerHTML = '';
  let total = 0;
  let itemsTotales = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    itemsTotales += 1;
    
  // Dentro de tu carrito.forEach en actualizarCarritoHTML:

  const esCarne = item.isGrasa === true;
  const valorGrasaActual = item.quitaGrasa ? item.quitaGrasa.replace('%', '') : 90;
  cartList.innerHTML += `
    <li class="list-group-item d-flex flex-column lh-sm py-3">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h6 class="my-0 fw-bold">${item.nombre}</h6>
          <small class="text-body-secondary">${item.cantidad} ${item.unidad} x $${item.precio.toFixed(2)}</small>
        </div>
        <div class="d-flex align-items-center">
          <span class="fw-bold me-2">
          $${Number(subtotal).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <button onclick="eliminarDelCarrito(${index})" class="btn btn-sm text-danger fw-bold border-0">
            <b>X</b>
          </button>
        </div>
      </div>

      ${esCarne ? `
        <div class="mt-3 p-2 bg-light rounded border">
          <label class="form-label d-flex justify-content-between mb-1" style="font-size: 0.85rem;">
            <span>Quitar grasa:</span>
            <span class="fw-bold text-primary" id="grasa-val-${index}">${valorGrasaActual}%</span>
          </label>
          <input type="range" class="form-range" min="0" max="100" step="10" 
                        value="${valorGrasaActual}" 
                        oninput="document.getElementById('grasa-val-${index}').innerText = this.value + '%'; actualizarGrasa(${index}, this.value)">
                  </div>
      ` : ''}
    </li>
  `;
  });
// ACTUALIZACIÓN DE VALORES REALES
  const totalFormateado = `$${Number(total).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  cartCount.innerText = itemsTotales;
  if(cartTotalOffcanvas) cartTotalOffcanvas.innerText = totalFormateado;
  
  // ESTA ES LA LÍNEA CLAVE:
  if(cartTotalHeader) cartTotalHeader.innerText = totalFormateado;
};

let categoriaActual = 'todos';
let paginaActual = 1;
let terminoBusqueda = ''; // Nueva variable de estado
const productosPorPagina = 15;
// Función que se dispara al clickear la lupa o dar Enter
window.ejecutarBusqueda = function(event) {
    if(event) event.preventDefault(); // Evita que la página se recargue
    
    const input = document.getElementById('input-busqueda');
    terminoBusqueda = input.value.toLowerCase().trim(); // Guardamos en minúsculas
    
    // Como pediste: si busca, volvemos a la categoría "Todos"
    categoriaActual = 'todos';
    paginaActual = 1;

    // Activar visualmente la pestaña de "Todos" (opcional pero recomendado)
    const tabTodos = document.getElementById('nav-all-tab');
    if(tabTodos) {
        const tabTrigger = new bootstrap.Tab(tabTodos);
        tabTrigger.show();
    }

    renderizarProductos();
      const targetElement=document.getElementById('nav-tab')

        const yOffset = -140; 
      const yPos = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: yPos,
        behavior: 'smooth'
      });
};
window.ejecutarBusqueda2 = function(event,name) {
    if(event) event.preventDefault(); // Evita que la página se recargue
    const input = document.getElementById('input-busqueda');
    input.value = name;
    terminoBusqueda = name.toLowerCase().trim(); // Guardamos en minúsculas
    
    // Como pediste: si busca, volvemos a la categoría "Todos"
    categoriaActual = 'todos';
    paginaActual = 1;

    // Activar visualmente la pestaña de "Todos" (opcional pero recomendado)
    const tabTodos = document.getElementById('nav-all-tab');
    if(tabTodos) {
        const tabTrigger = new bootstrap.Tab(tabTodos);
        tabTrigger.show();
    }

    renderizarProductos();
      const targetElement=document.getElementById('nav-tab')

        const yOffset = -140; 
      const yPos = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: yPos,
        behavior: 'smooth'
      });
};
window.ejecutarBusquedaSecundaria = function(event) {
    if(event) event.preventDefault();
    
    // 1. Capturamos lo que se escribió en ESTE form
    const nuevoTexto = document.getElementById('input-busqueda-secundario').value;
    
    // 2. Lo sincronizamos con el input del header (opcional, para que no queden distintos)
    const inputHeader = document.getElementById('input-busqueda');
    if(inputHeader) inputHeader.value = nuevoTexto;
    const normalizarTexto = (texto) => {
      return texto
          .normalize("NFD") // Descompone los caracteres acentuados (ej: 'á' -> 'a' + '´')
          .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
          .toLowerCase();
  };
// 1. CERRAR EL OFFCANVAS
    const offcanvasElement = document.getElementById('offcanvasSearch');
    const instance = bootstrap.Offcanvas.getInstance(offcanvasElement); 
    
    if (instance) {
        instance.hide(); // Esto lo cierra suavemente
    }
    // 3. Actualizamos la variable global y ejecutamos la lógica que ya tenemos
    terminoBusqueda = normalizarTexto(nuevoTexto);
    categoriaActual = 'todos';
    paginaActual = 1;

    // 4. Cambiamos visualmente a la pestaña "Todos"
    const tabTodos = document.getElementById('nav-all-tab');
    if(tabTodos) {
        const tabTrigger = new bootstrap.Tab(tabTodos);
        tabTrigger.show();
    }

    // 5. Renderizamos y hacemos scroll hasta los productos para que el usuario vea el resultado
    renderizarProductos();
    
    window.scrollTo({ 
        top: document.getElementById('nav-tab').offsetTop - 150, 
        behavior: 'smooth' 
    });
};

window.renderizarProductos = function() {
// 1. FILTRADO COMPLEJO
    let productosFiltrados = productos;

    // Filtro por Categoría
    if (categoriaActual !== 'todos') {
        productosFiltrados = productosFiltrados.filter(p => p.categoria === categoriaActual);
    }

  const normalizarTexto = (texto) => {
      return texto
          .normalize("NFD") // Descompone los caracteres acentuados (ej: 'á' -> 'a' + '´')
          .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
          .toLowerCase();
  };

    if (terminoBusqueda !== '') {
        const busquedaLimpia = normalizarTexto(terminoBusqueda);

        productosFiltrados = productosFiltrados.filter(p => {
            const nombreProdLimpio = normalizarTexto(p.nombre);

            // 1. Intento de coincidencia exacta (sin tildes)
            if (nombreProdLimpio.includes(busquedaLimpia)) return true;

            // 2. Lógica de "4 letras seguidas" (sin tildes)
            if (busquedaLimpia.length >= 4) {
                for (let i = 0; i <= busquedaLimpia.length - 4; i++) {
                    const fragmento = busquedaLimpia.substring(i, i + 4);
                    if (nombreProdLimpio.includes(fragmento)) {
                        return true;
                    }
                }
            }
            
            return false;
        });
    }

    // 2. PAGINACIÓN
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPaginados = productosFiltrados.slice(inicio, fin);

    // 3. SELECCIÓN DE GRID
    // Si estamos buscando, siempre mandamos al grid-all
    const gridTarget = document.getElementById('grid-all');
    if (!gridTarget) return;
    const gridCarnes = document.getElementById('grid-carnes');


    // Limpiamos los grids
    document.querySelectorAll('.product-grid').forEach(grid => grid.innerHTML = '');
    // 4. DIBUJADO
    if (productosPaginados.length === 0) {
        gridTarget.innerHTML = `<div class="col-12 text-center py-5">
            <p class="fs-4 text-muted">No se encontraron productos para "${terminoBusqueda}"</p>
        </div>`;
    } else {
          productosPaginados.forEach(producto => {
        const cardHTML = `
            <div class="col">
              <div class="product-item h-100" style="width: 100%; margin: 0 auto; max-width: 360px; min-height: 450px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #eee; padding: 15px; border-radius: 10px;">
                <figure class="text-center">
                  <img src="${producto.imagen}" style="width: 200px; height: 200px; object-fit: contain;" class="tab-image">
                </figure>
                <div class="product-details">
                  <h3 style="font-size: 1.2rem;">${producto.nombre}</h3>
                  <span class="qty">${producto.unidad}</span>
                  <span class="price d-block mb-2"><strong>$${Number(producto.precio).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                </div>
                <div class="d-flex align-items-center justify-content-between mt-auto">
                  <div class="input-group product-qty" style="width: 80px;">
                    <input type="number" name="quantity" class="form-control input-number text-center" value="1.0" step="0.5" min="0.5">
                  </div>
                  <button onclick="agregarAlCarrito(${producto.id})" class="btn btn-outline-primary">
                    Agregar <iconify-icon icon="uil:shopping-cart"></iconify-icon>
                  </button>
                </div>
              </div>
            </div>`;

        // Si estamos en "todos", llenamos grid-all
        if (categoriaActual === 'todos') {
            gridTarget.innerHTML += cardHTML;
        } else if (categoriaActual === 'carnes') {
            gridCarnes.innerHTML += cardHTML;
        }
        
    });        }


    // 5. ACTUALIZAR PAGINACIÓN: Basada en el largo de productos filtrados
    renderizarPaginacion(productosFiltrados.length);
};

// Función para detectar cuando el usuario cambia de pestaña
window.cambiarCategoria = function(categoria) {
    categoriaActual = categoria;
    terminoBusqueda = '';
    paginaActual = 1; // Siempre resetear a la página 1 al cambiar de categoría
    renderizarProductos();
};

window.renderizarPaginacion = function(totalProductos) {
    const pagContainer = document.getElementById('pagination-container');
    const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
    
    pagContainer.innerHTML = '';
    if (totalPaginas <= 1) return; // Si no hay más de 10 productos, no mostramos paginación

    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
        li.innerHTML = `<button class="page-link" onclick="cambiarPagina(${i})">${i}</button>`;
        pagContainer.appendChild(li);
    }
};

window.cambiarPagina = function(num) {
    paginaActual = num;
    renderizarProductos();
    window.scrollTo({ top: document.getElementById('nav-tabContent').offsetTop - 150, behavior: 'smooth' });
};



  var initPreloader = function() {
    $(document).ready(function($) {
    var Body = $('body');
        Body.addClass('preloader-site');
    });
    $(window).load(function() {
        $('.preloader-wrapper').fadeOut();
        $('body').removeClass('preloader-site');
    });
  }

  // init Chocolat light box
	var initChocolat = function() {
		Chocolat(document.querySelectorAll('.image-link'), {
		  imageSize: 'contain',
		  loop: true,
		})
	}

  var initSwiper = function() {

    var swiper = new Swiper(".main-swiper", {
      speed: 500,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });

    var category_swiper = new Swiper(".category-carousel", {
      slidesPerView: 6,
      spaceBetween: 30,
      speed: 500,
      navigation: {
        nextEl: ".category-carousel-next",
        prevEl: ".category-carousel-prev",
      },
      breakpoints: {
        0: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 3,
        },
        991: {
          slidesPerView: 4,
        },
        1500: {
          slidesPerView: 6,
        },
      }
    });

    var brand_swiper = new Swiper(".brand-carousel", {
      slidesPerView: 4,
      spaceBetween: 30,
      speed: 500,
      navigation: {
        nextEl: ".brand-carousel-next",
        prevEl: ".brand-carousel-prev",
      },
      breakpoints: {
        0: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 2,
        },
        991: {
          slidesPerView: 3,
        },
        1500: {
          slidesPerView: 4,
        },
      }
    });

    var products_swiper = new Swiper(".products-carousel", {
      slidesPerView: 5,
      spaceBetween: 30,
      speed: 500,
      navigation: {
        nextEl: ".products-carousel-next",
        prevEl: ".products-carousel-prev",
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 3,
        },
        991: {
          slidesPerView: 4,
        },
        1500: {
          slidesPerView: 6,
        },
      }
    });
  }

  var initProductQty = function(){

    $('.product-qty').each(function(){

      var $el_product = $(this);
      var quantity = 0;

      $el_product.find('.quantity-right-plus').click(function(e){
          e.preventDefault();
          var quantity = parseInt($el_product.find('#quantity').val());
          $el_product.find('#quantity').val(quantity + 1);
      });

      $el_product.find('.quantity-left-minus').click(function(e){
          e.preventDefault();
          var quantity = parseInt($el_product.find('#quantity').val());
          if(quantity>0){
            $el_product.find('#quantity').val(quantity - 1);
          }
      });

    });

  }

  // init jarallax parallax
  var initJarallax = function() {
    jarallax(document.querySelectorAll(".jarallax"));

    jarallax(document.querySelectorAll(".jarallax-keep-img"), {
      keepImg: true,
    });
  }
  var ids = function() {  
  document.getElementById('category-meat-link').addEventListener('click', function (e) {
    e.preventDefault();
    // Busca el tab original en el nav superior y lo activa
    const triggerEl = document.querySelector('#nav-fruits-tab');
    bootstrap.Tab.getOrCreateInstance(triggerEl).show();
       const targetElement=document.getElementById('nav-tab')
        cambiarCategoria('carnes')

        const yOffset = -140; 
      const yPos = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: yPos,
        behavior: 'smooth'
      });})
    document.getElementById('category-frutas-link').addEventListener('click', function (e) {
    e.preventDefault();
    // Busca el tab original en el nav superior y lo activa
    const triggerEl = document.querySelector('#nav-all-tab');
    bootstrap.Tab.getOrCreateInstance(triggerEl).show();     const targetElement=document.getElementById('nav-tab')
   
        const yOffset = -140; 
      const yPos = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: yPos,
        behavior: 'smooth'
      });;})
    document.getElementById('category-panificados-link').addEventListener('click', function (e) {
    e.preventDefault();
    // Busca el tab original en el nav superior y lo activa
    const triggerEl = document.querySelector('#nav-all-tab');
    bootstrap.Tab.getOrCreateInstance(triggerEl).show();    const targetElement=document.getElementById('nav-tab')
   
        const yOffset = -140; 
      const yPos = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: yPos,
        behavior: 'smooth'
      }); })
    document.getElementById('category-jugos-link').addEventListener('click', function (e) {
    e.preventDefault();
    // Busca el tab original en el nav superior y lo activa
    const triggerEl = document.querySelector('#nav-all-tab');
    bootstrap.Tab.getOrCreateInstance(triggerEl).show();     const targetElement=document.getElementById('nav-tab')
   
        const yOffset = -140; 
      const yPos = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: yPos,
        behavior: 'smooth'
      });;})
    document.getElementById('category-vino-link').addEventListener('click', function (e) {
    e.preventDefault();
    // Busca el tab original en el nav superior y lo activa
    const triggerEl = document.querySelector('#nav-all-tab');
    bootstrap.Tab.getOrCreateInstance(triggerEl).show();    const targetElement=document.getElementById('nav-tab')
   
        const yOffset = -140; 
      const yPos = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: yPos,
        behavior: 'smooth'
      }); })
    document.getElementById('category-almacen-link').addEventListener('click', function (e) {
    e.preventDefault();
    // Busca el tab original en el nav superior y lo activa
    const triggerEl = document.querySelector('#nav-all-tab');
    bootstrap.Tab.getOrCreateInstance(triggerEl).show(); 
   const targetElement=document.getElementById('nav-tab')
   
        const yOffset = -140; 
      const yPos = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: yPos,
        behavior: 'smooth'
      }); })
    // Opcional: Hacer scroll suave hacia los productos si el nav está lejos
   
 }
var selects = function() {  
document.getElementById('select-categorias').addEventListener('change', function() {
    const targetId = this.value; // Obtiene el ID del value seleccionado

    if (targetId) {
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // 1. Si el destino es un Tab de Bootstrap, lo activamos primero
        const tabTrigger = document.querySelector(`[data-bs-target="#${targetId}"]`);
        if (tabTrigger) {
          bootstrap.Tab.getOrCreateInstance(tabTrigger).show();
        }
      if(targetId=="nav-fruits"){
        cambiarCategoria('carnes')
      }else{
        cambiarCategoria('todos')
      }
      // 2. Cálculo de posición con margen
      // Ajustá este número (100) según cuánto espacio quieras dejar arriba
      const yOffset = -240; 
      const yPos = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: yPos,
        behavior: 'smooth'
      });
        
        // Opcional: Resetear el select a "Categorías" después de saltar
        // this.value = ""; 
      }
    }
  });
 }
document.addEventListener("DOMContentLoaded", function() {
    const inputFecha = document.getElementById('fechaEntrega');
    
    // Establecer la fecha mínima como "ahora" para que no elijan el pasado
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    inputFecha.min = ahora.toISOString().slice(0, 16);
    inputFecha.value = ahora.toISOString().slice(0, 16);
});
window.iniciarLoginGoogle = function () {

    google.accounts.id.initialize({
        client_id: "557149253717-ko2c1pmeo3rgvjt4st44bjumb39ndv0c.apps.googleusercontent.com",
        callback: manejarRespuestaGoogle
    });

    google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        {
            theme: "outline",
            size: "large",
            width: "100%", 
            type: "standard",
            shape: "rectangular"           
        }
    );

    const p = document.getElementById('googleP');

    // 👇 lo mostrás cuando se inicializa el login
    if (p) {
        p.style.display = "block";
        p.classList.add("warning"); // opcional si querés rojo
    }
};
window.iniciarLoginGoogle2 = function () {

    google.accounts.id.initialize({
        client_id: "557149253717-ko2c1pmeo3rgvjt4st44bjumb39ndv0c.apps.googleusercontent.com",
        callback: manejarRespuestaGoogle2
    });

    google.accounts.id.renderButton(
        document.getElementById("googleBtn2"),
        {
            theme: "outline",
            size: "large",
            width: "100%", 
            type: "standard",
            shape: "rectangular"           
        }
    );

    const p = document.getElementById('googleP2');

    // 👇 lo mostrás cuando se inicializa el login
    if (p) {
        p.style.display = "block";
        p.classList.add("warning"); // opcional si querés rojo
    }
    const tusDatos = document.getElementById('tusDatos');
    if (tusDatos) {
        tusDatos.style.display = "none";
    }
    
};
async function getUser(email) {
  try {
    const response = await fetch(
      `http://127.0.0.1:3010/user/${email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error al obtener usuario:", errorText);

      return false;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return false;

  }
}
async function postPedido(payload) {
  try {
    const response = await fetch(
      `http://127.0.0.1:3010/pedido/`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error al obtener usuario:", errorText);
      return false;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return false;

  }
}
async function listarPedidos() {
  try {
    const response = await fetch(
      `http://127.0.0.1:3010/pedido/${usuarioLogueado.email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error al obtener usuario:", errorText);
      return false;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return false;

  }
}
async function manejarRespuestaGoogle(response) {
    // El 'credential' es un JWT. Para lab, podemos decodificarlo para obtener el email.
    const payload = parseJwt(response.credential);
    usuarioLogueado = {
        id_google: payload.sub,
        nombre: payload.name,
        email: payload.email,
        foto: payload.picture
    };

    sessionStorage.setItem('usuario_google', JSON.stringify(usuarioLogueado));
    const p = document.getElementById('googleP');

    if (p) {
        p.style.display = "none";
    }
    document.getElementById("googleBtn").style.display = "none";
    const user= await getUser( payload.email);
    if(user){
      console.log("s")
    }else{
          const inputNombre = document.getElementById('cliente-nombre');
          if (inputNombre) {
              inputNombre.value = usuarioLogueado.nombre;
          }

          // 👇 Abrir modal automáticamente
          const modalElement = document.getElementById('modalDatosEnvio');
          if (modalElement) {
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
          } 
    }
    



}
async function manejarRespuestaGoogle2(response) {
    // El 'credential' es un JWT. Para lab, podemos decodificarlo para obtener el email.
    const payload = parseJwt(response.credential);
    usuarioLogueado = {
        id_google: payload.sub,
        nombre: payload.name,
        email: payload.email,
        foto: payload.picture
    };

    sessionStorage.setItem('usuario_google', JSON.stringify(usuarioLogueado));
    const p = document.getElementById('googleP2');

    if (p) {
        p.style.display = "none";
    }
    document.getElementById("googleBtn2").style.display = "none";
    document.getElementById("tusDatos").style.display = "block";

    const user= await getUser( payload.email);
    if(user){
         const name = document.getElementById('cliente-nombre')
          if (name && user.name) {
              name.value = user.name;
          }
          const phone = document.getElementById('cliente-telefono')
          if (phone && user.phone) {
              phone.value = user.phone;
          }          
          const address = document.getElementById('cliente-direccion')
          if (address && user.address) {
              address.value = user.address;
          }   
    }else{
          const inputNombre = document.getElementById('cliente-nombre');
          if (inputNombre) {
              inputNombre.value = usuarioLogueado.nombre;
          }


    }
    



}
// Función auxiliar para leer los datos del token de Google
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
}
window.confirmarPedidoFinal = async function() {
    const name = document.getElementById('cliente-nombre').value;
    const phone = document.getElementById('cliente-telefono').value;
    const address = document.getElementById('cliente-direccion').value;
    const email = usuarioLogueado.email;

    const usuario = {
        name,
        phone,
        address,
        email
    };

    await guardarUsuarioEnBD(usuario);
    const modalElement = document.getElementById('modalDatosEnvio');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
}
 
async function guardarUsuarioEnBD(usuario) {
     try {
        await fetch('http://127.0.0.1:3010/create-user', {
            method: 'POST',
            body: JSON.stringify(usuario),
            headers: {'Content-Type': 'application/json'}
        });
    } catch (error) {
        console.error("Error al guardar en BD", error);
    
    } 
}

function mostrarNotificacion(mensaje = "¡Éxito!") {
    const toastElement = document.getElementById('liveToast');
    const toastBody = toastElement.querySelector('.toast-body');
    
    // Actualizar el texto por si quieres usarlo para otras cosas
    toastBody.innerHTML = `<iconify-icon icon="mdi:check-circle-outline" class="me-2"></iconify-icon> ${mensaje}`;
    
    // Inicializar y mostrar con Bootstrap
    const toast = new bootstrap.Toast(toastElement, {
        delay: 3000 // Se cierra solo en 3 segundos
    });
    toast.show();
}

function renderizarMisPedidosUI(lista) {
// 1. Intentar capturar los elementos
    const el = document.getElementById('offcanvasOrders');
    const instance = bootstrap.Offcanvas.getOrCreateInstance(el);
        instance.show();
    const container = document.getElementById('orders-container');
    const emptyMsg = document.getElementById('empty-orders-msg');

    // 2. Validación de seguridad: Si no existen, salimos silenciosamente
    if (!container || !emptyMsg) {
        console.error("Error: No se encontró 'orders-container' o 'empty-orders-msg' en el DOM.");
        return;
    }

    // 3. Si no hay pedidos, mostramos el mensaje de vacío
    if (!lista || lista.length === 0) {
        emptyMsg.classList.remove('d-none');
        container.innerHTML = ''; // Limpiamos pedidos previos
        return;
    }

    // 4. Si hay pedidos, ocultamos el mensaje y renderizamos
    emptyMsg.classList.add('d-none');
    container.innerHTML = ''; // Limpiar contenedor

    lista.forEach(pedido => {
        const badgeColor = pedido.metodo === 'Delivery' ? 'bg-info' : 'bg-warning';
        const total = pedido.pedidoInividual.reduce((acc, item) => {
        return acc + ((item.precio || 0) * (item.cantidad || 0));
    }, 0);
      const statusHTML = pedido.status 
        ? `<div class="mb-2">
                <span class="badge border text-dark bg-white">
                    Estado: ${pedido.status}
                </span>
          </div>`
        : '';
       const statusComment = pedido.comment 
        ? `  <ul class="list-group list-group-flush mb-2" style="font-size: 0.85rem;">

                   <span>${pedido.comment}</span></span>
          </ul>
          `
        : '';
        // Formatear fecha si viniera en el objeto (opcional)
        const pedidoHTML = `
            <div class="card mb-3 border-light shadow-sm">
                <div class="card-body p-3">
                            ${statusHTML}

                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <small class="text-muted d-block font-monospace" style="font-size: 0.7rem;">
                                ID: ${pedido._id ? pedido._id.slice(-6).toUpperCase() : 'N/A'}
                            </small>
                            <span class="badge ${badgeColor} text-dark small">${pedido.metodo}</span>
                            <span class="badge ${badgeColor} text-dark small">${pedido.fecha}</span>

                        </div>
                        <strong class="text-primary">
                        ${Number(total).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                    </div>

                    <ul class="list-group list-group-flush mb-2" style="font-size: 0.85rem;">
                        ${pedido.pedidoInividual.map(item => `
                            <li class="list-group-item d-flex justify-content-between px-0 py-1 bg-transparent border-0">
                                <span>${item.cantidad}x <span class="text-capitalize">${item.productName} Desengrasado: ${item.quitaGrasa}</span></span>
                                <span class="text-muted">$${(item.precio * item.cantidad).toFixed(2)}</span>
                            </li>
                        `).join('')}
                    </ul>
                    ${statusComment}
                 

                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', pedidoHTML);
    });
}
window.renderizarMisPedidos = async function(event) {
    if(event) event.preventDefault();
    
    // 1. Obtener
    const lista = await listarPedidos();
    
    // 2. Renderizar
    renderizarMisPedidosUI(lista);
}
// Función para capturar los datos y enviar (esquema)
window.enviarPedidoWhatsApp = async function() {
    const metodo = document.querySelector('input[name="metodoEntrega"]:checked').value;
    const fecha = document.getElementById('fechaEntrega').value;
    const comment = document.getElementById('comment').value;

    if(!fecha) {
        alert("Por favor, selecciona una fecha y hora");
        return;
    }
    
    if(carrito.length === 0) {
        alert("Por favor, selecciona un producto");
        return;
    }

    if (!usuarioLogueado) {
            // Si no está logueado, llamamos a la función de Google
            iniciarLoginGoogle();
            return 
        }
    const user = await getUser(usuarioLogueado.email);
    if (user) {
      if(metodo=="Delivery"){
        if(!user.address || !user.phone){
          alert("Necesitamos la direccion de entrega y un telefono")
          const name = document.getElementById('cliente-nombre')
          if (name && user.name) {
              name.value = user.name;
          }
          const phone = document.getElementById('cliente-telefono')
          if (phone && user.phone) {
              phone.value = user.phone;
          }          
          const address = document.getElementById('cliente-direccion')
          if (address && user.address) {
              address.value = user.address;
          }           
          const modalElement = document.getElementById('modalDatosEnvio');
          if (modalElement) {
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
          } 
          return;
        }
      }else{
        if(!user.phone){
          alert("Necesitamos un telefono")
          const name = document.getElementById('cliente-nombre')
          if (name && user.name) {
              name.value = user.name;
          }
          const phone = document.getElementById('cliente-telefono')
          if (phone && user.phone) {
              phone.value = user.phone;
          }          
          const address = document.getElementById('cliente-direccion')
          if (address && user.address) {
              address.value = user.address;
          } 
          const modalElement = document.getElementById('modalDatosEnvio');
          if (modalElement) {
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
          } 
          return;          
      }}

      let carritoNew=[]
      carrito.forEach(element => {
        carritoNew.push({productId:element.id,quitaGrasa:element.quitaGrasa || "90%",cantidad:element.cantidad,precio:element.precio})
      }
      )
      const payload={
        fecha:fecha,
        metodo:metodo,
        status:"Ordenado",
        userEmail:usuarioLogueado.email,
        pedidoInividual:carritoNew,
        comment:comment
      }
      const response=await postPedido(payload)
      if(response){
        const myOffcanvas = document.getElementById('offcanvasCart');
        const instance = bootstrap.Offcanvas.getInstance(myOffcanvas); // Obtiene la que ya existe
        await renderizarMisPedidos()
        mostrarNotificacion("¡Pedido enviado con éxito, mira tus pedidos en tu perfil!");
        carrito=[];
        if (instance) {
            instance.hide();
        }
      }else{
        alert("error")
      }
    }
      else{
          const inputNombre = document.getElementById('cliente-nombre');
          if (inputNombre) {
              inputNombre.value = usuarioLogueado.nombre;
          }

          // 👇 Abrir modal automáticamente
          const modalElement = document.getElementById('modalDatosEnvio');
          if (modalElement) {
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
          } 
    }

  };
var modalPerson = function() {  

    const modalElement = document.getElementById('modalDatosEnvio');

    modalElement.addEventListener('shown.bs.modal', function () {
      if(!usuarioLogueado){
        iniciarLoginGoogle2();
      
      }
    });
 }
  // document ready
$(document).ready(function() { 
    getProducts()

    initPreloader();
    initSwiper();
    initProductQty();
    initJarallax();
    initChocolat();
    ids()
    selects()
    
    modalPerson()
   const vacio = document.getElementById('vacio');
  }); // End of a document

})(jQuery);