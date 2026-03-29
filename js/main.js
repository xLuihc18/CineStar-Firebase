import { db } from './Conexion.js';
import { 
    collection, 
    getDocs, 
    query, 
    doc,       
    getDoc,
    where   
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const renderCines = async (contenedor) => {
    try {
        contenedor.innerHTML = "<br/><h1>Nuestros Cines</h1><br/>";
        
        //Traemos todos los cines de Firebase
        const querySnapshot = await getDocs(collection(db, "cines"));

        querySnapshot.forEach((doc) => {
            const c = doc.data();
            
            contenedor.innerHTML += `
                <div class="contenido-cine">
                    <img src="img/cine/${doc.id}.1.jpg" width="227" height="170" onerror="this.src='img/varios/no-image.jpg'"/>
                    <div class="datos-cine">
                        <h4>${c.RazonSocial}</h4><br/>
                        <span>${c.Direccion} - ${c.Distrito}<br/><br/>Teléfono: ${c.Telefonos}</span>
                    </div>
                    <br/>
                    <a href="cine.html?id=${doc.id}">
                        <img src="img/varios/ico-info2.png" width="150" height="40" alt="Más información"/>
                    </a>
                </div>`;
        });
    } catch (e) {
        console.error("Error cargando la lista de cines:", e);
        contenedor.innerHTML = "<h2>Error al conectar con la lista de cines</h2>";
    }
};

const renderDetalleCine = async (contenedor) => {
    const urlParams = new URLSearchParams(window.location.search);
    const idCine = urlParams.get('id');

    if (!idCine) return;

    try {
        const docRef = doc(db, "cines", idCine);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const c = docSnap.data();

            //Generar filas de Tarifas
            let htmlTarifas = "";
            c.tarifas.forEach((t, index) => {
                const claseFila = (index % 2 !== 0) ? "fila impar" : "fila";
                htmlTarifas += `
                    <div class="${claseFila}">
                        <div class="celda-titulo">${t.DiasSemana}</div>
                        <div class="celda">${t.Precio}</div>
                    </div>`;
            });

            //Generar filas de peliculas/horarios con cabecera
            let htmlPeliculas = `
                <div class="fila">
                    <div class="celda-cabecera">Películas</div>
                    <div class="celda-cabecera">Horarios</div>
                </div>`;
            
            c.peliculas.forEach((p, index) => {
                const claseFila = (index % 2 == 0) ? "fila impar" : "fila"; // Empezamos con impar después de cabecera
                htmlPeliculas += `
                    <div class="${claseFila}">
                        <div class="celda-titulo">${p.Titulo}</div>
                        <div class="celda">${p.Horarios}</div>
                    </div>`;
            });

            //Renderizar todo el bloque
            contenedor.innerHTML = `
                <h2>${c.RazonSocial}</h2>
                <div class="cine-info">
                    <div class="cine-info datos">
                        <p>${c.Direccion} - ${c.Distrito}</p>
                        <p>Teléfono: ${c.Telefonos}</p>
                        <br/>
                        <div class="tabla">
                            ${htmlTarifas}
                        </div>
                        <div class="aviso">
                            <p>A partir del 1ro de julio de 2016, Cinestar Multicines realizará el cobro de la comisión de S/. 1.00 adicional al tarifario vigente...</p>
                        </div>
                    </div>
                    <img src="img/cine/${idCine}.2.jpg" onerror="this.src='img/varios/no-image.jpg'"/>
                    <br/><br/><h4>Los horarios de cada función están sujetos a cambios sin previo aviso.</h4><br/>
                    <div class="cine-info peliculas">
                        <div class="tabla">
                            ${htmlPeliculas}
                        </div>
                    </div>
                </div>
                <div>
                    <img style="float:left;" src="img/cine/${idCine}.3.jpg" alt="Imagen del cine" onerror="this.src='img/varios/no-image.jpg'"/>
                    <span class="tx_gris">Precios de los juegos: desde S/1.00 en todos los Cine Star.<br/>
                        Horario de atención de juegos es de 12:00 m hasta las 10:30 pm. 
                        <br/><br/>
                        Visitános y diviértete con nosotros. 
                        <br/><br/>
                        <b>CINESTAR</b>, siempre pensando en tí. 
                    </span>     
                </div>`;
        }
    } catch (e) {
        console.error("Error cargando detalle:", e);
    }
};

const renderPeliculasLista = async (contenedor) => {
    const urlParams = new URLSearchParams(window.location.search);
    const tipoUrl = urlParams.get('id'); // 'cartelera' o 'estrenos'

    if (!tipoUrl) return;

    try {
        //Configuracion dinamica segun el tipo
        const esCartelera = (tipoUrl === 'cartelera');
        const estadoFiltro = esCartelera ? "1" : "2";
        const tituloPagina = esCartelera ? 'Cartelera' : 'Próximos Estrenos';

        //Filtramos por idEstado
        const q = query(
            collection(db, "peliculas"), 
            where("idEstado", "==", estadoFiltro)
        );

        const querySnapshot = await getDocs(q);
        contenedor.innerHTML = `<br/><h1>${tituloPagina}</h1><br/>`;

        if (querySnapshot.empty) {
            contenedor.innerHTML += `<h3>No hay películas disponibles en esta sección por ahora.</h3>`;
            return;
        }

        //Renderizado de las peliculas
        querySnapshot.forEach((doc) => {
            const p = doc.data();
            
            contenedor.innerHTML += `
                <div class="contenido-pelicula">
                    <div class="datos-pelicula">
                        <h2>${p.Titulo}</h2><br/>
                        <p>${p.Sinopsis.substring(0, 160)}...</p>
                        <br/>
                        <div class="boton-pelicula"> 
                            <a href="pelicula.html?id=${doc.id}">
                                <img src="img/varios/btn-mas-info.jpg" width="120" height="30" alt="Ver info"/>
                            </a>
                        </div>
                        <div class="boton-pelicula"> 
                            <a href="https://www.youtube.com/v/${p.Link}" target="_blank">
                                <img src="img/varios/btn-trailer.jpg" width="120" height="30" alt="Ver trailer"/>
                            </a>
                        </div> 
                    </div>
                    <img src="img/pelicula/${doc.id}.jpg" width="160" height="226" onerror="this.src='img/varios/no-image.jpg'"/><br/><br/>
                </div>`;
        });

    } catch (e) {
        console.error("Error cargando la lista de películas:", e);
        contenedor.innerHTML = "<h2>Error de conexión con la cartelera</h2>";
    }
};

const renderDetallePelicula = async (contenedor) => {
    const urlParams = new URLSearchParams(window.location.search);
    const idPeli = urlParams.get('id'); 

    if (!idPeli) {
        contenedor.innerHTML = "<h1>Error: No se seleccionó una película</h1>";
        return;
    }

    try {
        const docRef = doc(db, "peliculas", idPeli);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const p = docSnap.data();

            contenedor.innerHTML = `
                <br/><h1>Cartelera</h1><br/>
                <div class="contenido-pelicula">
                    <div class="datos-pelicula">
                        <h2>${p.Titulo}</h2>
                        <p>${p.Sinopsis}</p>
                        <br/>
                        <div class="tabla">
                            <div class="fila">
                                <div class="celda-titulo">Título Original :</div>
                                <div class="celda">${p.Titulo}</div>
                            </div>
                            <div class="fila">
                                <div class="celda-titulo">Estreno :</div>
                                <div class="celda">${p.FechaEstreno || 'Próximamente'}</div>
                            </div>
                            <div class="fila">
                                <div class="celda-titulo">Género :</div>
                                <div class="celda">${p.Generos || p.Genero}</div>
                            </div>
                            <div class="fila">
                                <div class="celda-titulo">Director :</div>
                                <div class="celda">${p.Director}</div>
                            </div>
                            <div class="fila">
                                <div class="celda-titulo">Reparto :</div>
                                <div class="celda">${p.Reparto}</div>
                            </div>
                        </div>
                    </div>
                    <img src="img/pelicula/${doc.id}.jpg" width="160" height="226" onerror="this.src='img/varios/no-image.jpg'"><br/><br/>
                </div>
                <div class="pelicula-video">
                    <iframe width="580" height="400" 
                        src="https://www.youtube.com/embed/${p.Link}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>`;
        } else {
            contenedor.innerHTML = "<h1>Película no encontrada</h1>";
        }
    } catch (e) {
        console.error("Error cargando detalle película:", e);
        contenedor.innerHTML = "<h1>Error de conexión con Firebase</h1>";
    }
};

//Identificamos el contenedor y la pagina actual
const contenedor = document.getElementById('contenido-interno');
const pagina = window.location.pathname.split("/").pop(); 
if (contenedor) {
    contenedor.innerHTML = ""; 

    if (pagina === "peliculas.html") {
        renderPeliculasLista(contenedor);
    } 
    else if (pagina === "pelicula.html") {
        renderDetallePelicula(contenedor);
    } 
    else if (pagina === "cines.html") {
        renderCines(contenedor);
    } 
    else if (pagina === "cine.html") {
        renderDetalleCine(contenedor);
    }
}